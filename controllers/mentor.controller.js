module.exports = {
    listMentors: async (req, res) => {
        // stub - return empty list until real logic implemented
        res.json({ mentors: [] });
    },

    getMentorById: async (req, res) => {
        // stub
        res.status(404).json({ message: 'Mentor not found (stub).' });
    },

    createMentor: async (req, res) => {
        // stub
        res.status(201).json({ message: 'Mentor created (stub).' });
    },

    updateMentor: async (req, res) => {
        // stub
        res.json({ message: 'Mentor updated (stub).' });
    },

    deleteMentor: async (req, res) => {
        // stub
        res.json({ message: 'Mentor deleted (stub).' });
    }
};