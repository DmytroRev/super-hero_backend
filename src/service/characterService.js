import Character from "../db/models/Character.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import path from 'path';
import * as fs from 'fs/promises';

export const getAllCharacters = async ({page = 1, perPage = 5}) => {
const limit = perPage;
const skip = (page - 1) * perPage;

const [characterCount, characters] = await Promise.all([
    Character.countDocuments(),
    Character.find().skip(skip).limit(limit)
]);

const paginationData = calculatePaginationData(characterCount, perPage, page);

return {
    data: characters,
    ...paginationData
};
};


export const getCharacterById = async (characterId) => {
return Character.findById(characterId);
};


export const createCharacter = async (characterData) => {
    const character = new Character(characterData);
    await character.save();
    return character;
};


export const updateCharacter = async (id, data, file) => {
    const character = await Character.findById(id);
    if(!character) {
        throw new Error('Character not found!');
    }

    if(file) {
        character.avatarUrl = `/uploads/avatars/${file.filename}`;

        const avatarPath = path.resolve(('src', 'uploads', 'avatars', file.filename));
        await fs.rename(file.path, avatarPath);
    }

    if(file) {
        character.imagesUrl = `/uploads/avatars/${file.filename}`;

        const avatarPath = path.resolve(('src', 'uploads', 'avatars', file.filename));
        await fs.rename(file.path, avatarPath);
    }

    character.nickname = data.nickname || character.nickname;
    character.real_name = data.real_name || character.real_name;
    character.origin_description = data.origin_description || character.origin_description;
    character.superpowers = data.superpowers || character.superpowers;
    character.catch_phrase = data.catch_phrase || character.catch_phrase;
    character.imageUrl = data.imageUrl || character.imageUrl;

    await character.save();
    return character;
};

export const changeCharacterAvatar = async (userId, avatar) => {
    return Character.findByIdAndUpdate(userId, {avatarUrl: avatar});
};

export const deleteCharacter = async (id) => {
    const character = await Character.findById(id);
    if(!character) {
        throw new Error('Character not found!');
    }

    if(character.avatarUrl) {
const avatarPath = path.resolve('src', character.avatarUrl);
try {
    await fs.unlink(avatarPath);
} catch (err) {
console.error('Error deleting avatar:', err.message);

}
    };

    if(character.imagesUrl) {
        const imagesPath = path.resolve('src', character.imagesUrl);
        try {
            await fs.unlink(imagesPath);
        } catch (err) {
        console.error('Error deleting images:', err.message);

        }
            };

    await Character.findByIdAndDelete(id);
    return {message: 'Character deleted successfully!'};
};


