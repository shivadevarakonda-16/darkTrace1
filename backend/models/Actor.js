import mongoose from 'mongoose';

/**
 * Actor documents are intentionally schema-flexible (strict: false).
 * The in-memory attribution engines (infra scanner, identity graph,
 * stylometry, crypto correlation, fusion engine) work off the same rich
 * nested JSON shape defined in data/seedData.js. Rather than duplicate
 * that whole shape as a rigid Mongoose schema (and fight it every time a
 * field is added), we let Mongo store whatever object shape the app
 * hands it, and rely on the `id` field as the stable unique key that ties
 * a Mongo document back to the in-memory dbStore record.
 */
const ActorSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
  },
  { strict: false, timestamps: true, collection: 'actors' }
);

export default mongoose.model('Actor', ActorSchema);
