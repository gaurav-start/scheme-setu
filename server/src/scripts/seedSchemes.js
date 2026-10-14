import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/connectDB.js';
import Scheme from '../models/Scheme.js';
import RuleSet from '../models/RuleSet.js';
import { evaluateRule } from '../services/eligibility/ruleEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedSchemes = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for scheme seeding...');

    const jsonPathEn = path.join(__dirname, '../data/myscheme.json');
    const jsonPathHi = path.join(__dirname, '../data/myscheme_hi.json');

    let schemesData = [];
    if (fs.existsSync(jsonPathEn)) {
      const rawDataEn = fs.readFileSync(jsonPathEn, 'utf8');
      const listEn = JSON.parse(rawDataEn);
      if (Array.isArray(listEn)) schemesData.push(...listEn);
    }
    if (fs.existsSync(jsonPathHi)) {
      const rawDataHi = fs.readFileSync(jsonPathHi, 'utf8');
      const listHi = JSON.parse(rawDataHi);
      if (Array.isArray(listHi)) schemesData.push(...listHi);
    }

    if (schemesData.length === 0) {
      console.error('No scheme datasets found in server/src/data/');
      process.exit(1);
    }

    console.log(`Loaded ${schemesData.length} raw scheme record(s)...`);

    const buildRootRuleFromCriteria = (criteria) => {
      const conditions = [];

      if (criteria?.Personal?.age) {
        const ageStr = String(criteria.Personal.age);
        const match = ageStr.match(/\d+/);
        if (match) {
          const val = parseInt(match[0], 10);
          if (ageStr.toLowerCase().includes('below') || ageStr.toLowerCase().includes('under') || ageStr.toLowerCase().includes('less')) {
            conditions.push({ type: 'condition', field: 'age', operator: 'lte', value: val });
          } else {
            conditions.push({ type: 'condition', field: 'age', operator: 'gte', value: val });
          }
        }
      }

      if (criteria?.Personal?.gender && criteria.Personal.gender !== 'null' && criteria.Personal.gender !== 'All') {
        conditions.push({ type: 'condition', field: 'gender', operator: 'equals', value: criteria.Personal.gender });
      }

      if (criteria?.Personal?.category && criteria.Personal.category !== 'null' && criteria.Personal.category !== 'All') {
        conditions.push({ type: 'condition', field: 'casteCategory', operator: 'equals', value: criteria.Personal.category });
      }

      if (criteria?.Household?.hasBPLCard === true || criteria?.Household?.hasBPLCard === 'true') {
        conditions.push({ type: 'condition', field: 'hasBPLCard', operator: 'equals', value: true });
      }

      if (criteria?.SpecialConditions) {
        const flags = [
          { key: 'isStudent', field: 'isStudent' },
          { key: 'isFarmer', field: 'isFarmer' },
          { key: 'isWidow', field: 'isWidow' },
          { key: 'isSeniorCitizen', field: 'isSeniorCitizen' },
          { key: 'isOrphan', field: 'isOrphan' },
          { key: 'isExServiceman', field: 'isExServiceman' },
        ];
        for (const flag of flags) {
          if (criteria.SpecialConditions[flag.key] === true || criteria.SpecialConditions[flag.key] === 'true') {
            conditions.push({ type: 'condition', field: flag.field, operator: 'equals', value: true });
          }
        }
      }

      if (conditions.length === 0) {
        conditions.push({ type: 'condition', field: 'age', operator: 'gte', value: 0 });
      }

      return {
        type: 'group',
        operator: 'AND',
        conditions,
      };
    };

    const usedSlugs = new Set();
    const schemeOps = [];
    const ruleSetOps = [];

    for (const schemeItem of schemesData) {
      const name = schemeItem.name || schemeItem.scheme_name;
      const description = schemeItem.description || schemeItem.details || schemeItem.benefits || '';
      const customSlug = schemeItem.slug;
      const ministry = schemeItem.ministry || schemeItem.department || schemeItem.state_ut || '';
      const state = schemeItem.state || schemeItem.state_ut || 'All India';
      const category = schemeItem.category || 'General';
      const sourceUrl = schemeItem.sourceUrl || schemeItem.sources_and_references || '';
      const sourceDocument = schemeItem.sourceDocument || schemeItem.file_name || '';
      const status = schemeItem.status || 'active';

      if (!name || !description) continue;

      let rootRule = schemeItem.rootRule;
      if (!rootRule) {
        rootRule = buildRootRuleFromCriteria(schemeItem.eligibility_criteria);
      }

      const testResult = evaluateRule(rootRule, {});
      if (testResult.error && testResult.error !== 'Group contains no child conditions') {
        continue;
      }

      let baseSlug = customSlug || name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
      if (!baseSlug) baseSlug = 'scheme-' + Math.random().toString(36).substring(2, 7);

      let slug = baseSlug;
      let counter = 1;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      usedSlugs.add(slug);

      const schemeId = new mongoose.Types.ObjectId();
      const ruleSetId = new mongoose.Types.ObjectId();

      const metadata = {
        benefits: schemeItem.benefits || '',
        eligibilityText: schemeItem.eligibility || '',
        exclusions: schemeItem.exclusions || '',
        applicationProcess: schemeItem.application_process || '',
        documentsRequired: schemeItem.documents_required || '',
        faqs: schemeItem.faqs || '',
        sourcesAndReferences: schemeItem.sources_and_references || '',
        eligibilityCriteria: schemeItem.eligibility_criteria || {},
        rawText: schemeItem.raw_text || '',
      };

      schemeOps.push({
        updateOne: {
          filter: { slug },
          update: {
            $setOnInsert: {
              _id: schemeId,
            },
            $set: {
              name,
              slug,
              description,
              ministry: ministry || '',
              state: state || 'All India',
              category: category || 'General',
              sourceUrl: sourceUrl || '',
              sourceDocument: sourceDocument || '',
              status: status || 'active',
              currentRuleSetId: ruleSetId,
              metadata,
            },
          },
          upsert: true,
        },
      });

      ruleSetOps.push({
        updateOne: {
          filter: { schemeId, version: 1 },
          update: {
            $setOnInsert: {
              _id: ruleSetId,
              schemeId,
              version: 1,
              effectiveFrom: new Date(),
            },
            $set: {
              status: 'active',
              rootRule,
            },
          },
          upsert: true,
        },
      });
    }

    console.log(`Executing bulkWrite for ${schemeOps.length} schemes and ruleSets...`);

    // Execute bulk write in batches of 500
    const BATCH_SIZE = 500;
    for (let i = 0; i < schemeOps.length; i += BATCH_SIZE) {
      const batchSchemeOps = schemeOps.slice(i, i + BATCH_SIZE);
      const batchRuleSetOps = ruleSetOps.slice(i, i + BATCH_SIZE);

      await Scheme.bulkWrite(batchSchemeOps);
      await RuleSet.bulkWrite(batchRuleSetOps);
      console.log(`Seeded batch ${i / BATCH_SIZE + 1} (${Math.min(i + BATCH_SIZE, schemeOps.length)} / ${schemeOps.length})`);
    }

    const totalInDb = await Scheme.countDocuments();
    console.log(`🎉 Scheme seeding completed! Total active schemes in database: ${totalInDb}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding schemes:', err);
    process.exit(1);
  }
};

seedSchemes();
