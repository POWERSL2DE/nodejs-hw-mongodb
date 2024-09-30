import { ContactCollection } from '../models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';


export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
}) => {

  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactCollection.find();

  if (filter.type) {
    contactsQuery.where('contactType').equals(filter.type);
  }
  if(filter.isFavourite !== undefined) {
    contactsQuery.where('isFavourite').lte(filter.isFavourite);
  }


  const [contactsCount, contacts] = await Promise.all([
    ContactCollection.find().merge(contactsQuery).countDocuments(),
    contactsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec(),
  ]);


  const paginationData = calculatePaginationData(contactsCount, page, perPage);

  return {
    data: contacts,
    ...paginationData,
  };
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
