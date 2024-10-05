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


const router = Router();
router.use(authenticate);

router.get('/', ctrlWrapper(getContactsController));

router.get('/:contactId', isValidId, ctrlWrapper(getContactByIdController));

router.post('/', validateBody(contactAddSchema), ctrlWrapper(addContactController));

router.put('/:contactId', isValidId, validateBody(contactAddSchema), ctrlWrapper(upsertContactController));

router.patch('/:contactId', isValidId, validateBody(contactPatchSchema), ctrlWrapper(patchContactController));

router.delete('/:contactId', isValidId, ctrlWrapper(deleteContactController));



export default router;
