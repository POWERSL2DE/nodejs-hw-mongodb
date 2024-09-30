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


const router = Router();

router.get('/contacts', ctrlWrapper(getContactsController));

router.get('/contacts/:contactId', isValidId, ctrlWrapper(getContactByIdController));

router.post('/contacts', validateBody(contactAddSchema), ctrlWrapper(addContactController));

router.put('/contacts/:contactId', isValidId, validateBody(contactAddSchema), ctrlWrapper(upsertContactController));

router.patch('/contacts/:contactId', isValidId, validateBody(contactPatchSchema), ctrlWrapper(patchContactController));

router.delete('/contacts/:contactId', isValidId, ctrlWrapper(deleteContactController));

export default router;
