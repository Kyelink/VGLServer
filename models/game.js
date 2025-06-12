import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"]
    },
    steam_appid: {
        type: Number,
        unique: true,
        required: [true, "Please enter steam appid"]
    },
    description: {
        type: String,
        required: [true, "Please enter description"]
    },
    required_age: {
        type: Number,
        default: 0
    },
    is_free: {
        type: Boolean,
        default: false
    },
    dlc: {
        type: [String],
        default: []
    },
    release_date: {
        type: {
            coming_soon: Boolean,
            date: Date
        },
        required: true
    },
    header_image: {
        type: String,
        required: [true, "Please enter header image"]
    },
    developers: {
        type: [String],
        default: []
    },
    publishers: {
        type: [String],
        default: []
    },
    platforms: {
        type: {
            windows: Boolean,
            mac: Boolean,
            linux: Boolean
        },
        default: {
            windows: true,
            mac: false,
            linux: false
        }
    },
    genres: {
        type: [{
            id: Number,
            description: String
        }],
        default: []
    },
    tags: {
        type: [String],
        default: []
    },
    screenshots: {
        type: [{
            path_thumbnail: String,
            path_full: String
        }],
        default: []
    },
    movies: {
        type: [{
            name: String,
            thumbnail: String,
            webm: {
                "480":String,
                "max":String
            },
            mp4: {
                "480":String,
                "max":String
            }
        }],
        default: []
    },
    descriptions: {
        type: {
            french: String,
            english: String,
        }
    },
});

export const Game = mongoose.model("Game", schema);