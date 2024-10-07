import createHttpError from 'http-errors';

import { getAllContacts, getContactById } from '../services/contacts.js';
import { addContact } from '../services/contacts.js';
import { deleteContact } from '../services/contacts.js';
import { updateContact } from '../services/contacts.js';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseContactFilterParams } from '../utils/parseFilterParams.js';


export const getContactsController = async (req, res) => {
    const { page, perPage} = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const filter = parseContactFilterParams(req.query);

    const { _id: userId } = req.user;

    const contacts = await getAllContacts({
        page,
        perPage,
        sortBy,
        sortOrder,
        filter: {...filter, userId},
    });


    res.status(200).json({
        status: 200,
        message: 'Contacts are successfully found!',
        data: contacts,

    });
};

export const getContactByIdController = async (req, res, next) => {
    const { contactId } = req.params;
    const { _id: userId } = req.user;
    const contact = await getContactById(contactId, userId);


    if (!contact) {
        throw createHttpError(404, `Contact with id ${contactId} is not found`);
    }

    res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
    });
};


export const addContactController = async (req, res) => {
    const contactData = {
        ...req.body,
        userId: req.user._id,
    };

    const contact = await addContact(contactData);

    res.status(201).json({
        status: 201,
        message: `Successfully created a contact!`,
        data: contact,
    });
};


export const upsertContactController = async (req, res, next) => {
    const { contactId } = req.params;
    const { _id: userId } = req.user;

    const result = await updateContact({_id: contactId, userId}, req.body, {upsert: true});
    if (!result) {
        next(createHttpError(404, `Contact with id ${contactId} is not found`));
        return;
    }

    const status = result.isNew ? 201: 200;

    res.status(status).json({
        status,
        message: `Contact is successfully upserted`,
        data: result.contact,
    });
};

export const patchContactController = async (req, res, next) => {
    const { contactId } = req.params;
    const { _id: userId } = req.user;
    const result = await updateContact({_id: contactId, userId}, req.body);

    if (!result) {
        throw createHttpError(404, `Contact with id ${contactId} is not found`);

    }

    res.json({
        status: 200,
        message: `Contact is successfully patched!`,
        data: result.contact,
    });
};


export const deleteContactController = async (req, res) => {
    const { _id: userId } = req.user;
    const { contactId } = req.params;
    const contact = await deleteContact({_id: contactId, userId});

    if (!contact) {
        throw createHttpError(404, `Contact with id ${contactId} is not found`);

    }

    res.status(204).send();
};



