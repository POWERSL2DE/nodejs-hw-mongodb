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
  if (filter.userId) {
    contactsQuery.where('userId').equals(filter.userId);
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


export const getContactById = async ({contactId, userId}) => {
  const contact = await ContactCollection.findOne({
    _id: contactId,
    userId,
  });
  return contact;
};


export const addContact = async (payload) => {
  const contact = await ContactCollection.create(payload);
  return contact;
};


export const deleteContact = async ({_id, userId}) => {
  const contact = await ContactCollection.findOneAndDelete({
    _id,
    userId,
  });
  return contact;
};


export const updateContact = async ({_id, userId}, payload, options = {}) => {
    const rawResult = await ContactCollection.findOneAndUpdate(
    { _id, userId },
    payload,
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
