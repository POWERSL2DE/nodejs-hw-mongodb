import { Router } from 'express';
import { getContactsController,
        getContactByIdController,
        addContactController,
        deleteContactController,
        upsertContactController,
        patchContactController,
} from '../controllers/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { contactAddSchema, contactPatchSchema } from '../validation/contactsValidation.js';
import { authenticate } from '../middlewares/authenticate.js';


const contactsRouter = Router();
contactsRouter.use(authenticate);

contactsRouter.get('/', ctrlWrapper(getContactsController));

contactsRouter.get('/:contactId', isValidId, ctrlWrapper(getContactByIdController));

contactsRouter.post('/', validateBody(contactAddSchema), ctrlWrapper(addContactController));

contactsRouter.put('/:contactId', isValidId, validateBody(contactAddSchema), ctrlWrapper(upsertContactController));

contactsRouter.patch('/:contactId', isValidId, validateBody(contactPatchSchema), ctrlWrapper(patchContactController));

contactsRouter.delete('/:contactId', isValidId, ctrlWrapper(deleteContactController));



export default contactsRouter;
