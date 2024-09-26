import { ContactCollection } from '../models/contact.js';


export const getAllContacts = async () => {
  const contacts = await ContactCollection.find();
  return contacts;
};

export const getContactById = async (contactId) => {
  const contact = await ContactCollection.findById(contactId);
  return contact;
};


export const addContact = async (playload) => {
  const contact = await ContactCollection.create(playload);
  return contact;
};

export const deleteContact = async (contactId) => {
  const contact = await ContactCollection.findOneAndDelete({
    _id: contactId,
  });
  return contact;
};


export const updateContact = async (contactId, playload, options = {}) => {
    const rawResult = await ContactCollection.findOneAndUpdate(
    { _id: contactId },
    playload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};
