import { Schema, model } from 'mongoose';
import { contactTypeList } from '../constants/contactTypeList.js';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
      default: '',
    },
    isFavourite: {
      type: Boolean,
      required: false,
      default: false,
    },
    contactType: {
      type: String,
      required: true,
      enum: contactTypeList,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  },

);

export const sortFields = ['name', 'phoneNumber', 'email', 'isFavourite', 'contactType',];

export const ContactCollection = model('contact', contactSchema);
