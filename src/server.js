import express from "express";
import cors from "cors";
import pino from 'pino-http';
import dotenv from 'dotenv';
import { env } from "./utils/env.js";
import { getAllContacts, getContactById } from "./services/contacts.js";
//========================================================================//


dotenv.config();
const PORT = Number(env("PORT", 3000));


export const setupServer = () => {
    const app = express();
    app.use(express.json());
    app.use(cors());

    app.use(
        pino({
          transport: {
            target: 'pino-pretty',
          },
        }),
    );

    app.get('/contacts', async (req, res) => {
      const contacts = await getAllContacts();

      res.status(200).json({
        status: 200,
        message: 'Contacts are successfully found!',
        data: contacts,
      });
    });

    app.get('/contacts/:contactId', async (req, res, next) => {
      const { contactId } = req.params;
      const contact = await getContactById(contactId);

      if (!contact) {
        return res.status(404).json({
          message: 'Contact not found',
        });
      }

      res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
      });
    });

    app.use((req, res) => {
      res.status(404).json({
        message: `${req.url} not found`,
      });
    });

    app.use((error, req, res, next) => {
      res.status(500).json({
        message: error.message,
      });
    });

//=============================================================//
    app.listen(PORT, () => {
        console.log(`This server is running on PORT ${PORT}`);
    });
};


