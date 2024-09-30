import { contactTypeList } from "../constants/contactTypeList.js";

const parseType = (type) => {
    const isString = typeof type === 'string';
    if (!isString) return;
    const isType = (type) => contactTypeList.includes(type);
    if (isType(type)) return type;
};


const parseIsFavourite = (value) => {
    if(typeof value !== 'string') return;

    if(value === 'true' || value === '1') return true;
    if(value === 'false' || value === '0') return  false;

    return;
};


export const parseContactFilterParams = (query) => {
    const { type, isFavourite } = query;

    const parsedType = parseType(type);
    const parsedIsFavourite = parseIsFavourite(isFavourite);

    return {
        type: parsedType,
        isFavourite: parsedIsFavourite,
    };
};

