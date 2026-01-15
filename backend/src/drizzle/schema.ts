import { pgTable, uuid, text, decimal, integer, boolean, timestamp, jsonb, date, check } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Diseases
export const diseases = pgTable('diseases', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const diseasesRelations = relations(diseases, ({ one, many }) => ({
  user: one(users, {
    fields: [diseases.userId],
    references: [users.id],
  }),
  prescriptions: many(prescriptions),
}));

// Medicines
export const medicines = pgTable('medicines', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  manufacturer: text('manufacturer'),
  activeIngredients: text('active_ingredients'),
  price: decimal('price'),
  quantity: integer('quantity').default(0),
  unit: text('unit'), // e.g., 'tablet', 'ml', 'box'
  status: text('status'), // 'available', 'out_of_stock'
  createdAt: timestamp('created_at').defaultNow(),
});

export const medicinesRelations = relations(medicines, ({ one }) => ({
  user: one(users, {
    fields: [medicines.userId],
    references: [users.id],
  }),
}));

// Prescriptions
export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  diseaseId: uuid('disease_id').references(() => diseases.id).notNull(),
  frequency: text('frequency'), // e.g., 'daily', 'weekly'
  scheduledTimes: jsonb('scheduled_times'), // Array of strings ["08:00", "20:00"]
  startDate: date('start_date'),
  endDate: date('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  disease: one(diseases, {
    fields: [prescriptions.diseaseId],
    references: [diseases.id],
  }),
  prescriptionMedicines: many(prescriptionMedicines),
}));

// Prescription Medicines (Join Table)
export const prescriptionMedicines = pgTable('prescription_medicines', {
  id: uuid('id').defaultRandom().primaryKey(),
  prescriptionId: uuid('prescription_id').references(() => prescriptions.id).notNull(),
  medicineId: uuid('medicine_id').references(() => medicines.id).notNull(),
  dosage: text('dosage').notNull(), // e.g., "1 tablet"
});

export const prescriptionMedicinesRelations = relations(prescriptionMedicines, ({ one }) => ({
  prescription: one(prescriptions, {
    fields: [prescriptionMedicines.prescriptionId],
    references: [prescriptions.id],
  }),
  medicine: one(medicines, {
    fields: [prescriptionMedicines.medicineId],
    references: [medicines.id],
  }),
}));
