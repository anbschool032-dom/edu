const db = require('../../models'); // Go up 2 levels
const Industry = db.Industry;
const Position = db.Position;

// --- Industry ---
exports.createIndustry = async (req, res) => {
  const { industry_name } = req.body;
  if (!industry_name) return res.status(400).json({ message: 'Industry name required' });
  try {
    const industry = await Industry.create({ industry_name });
    res.status(201).json(industry);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'Industry already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getIndustries = async (req, res) => {
  try {
    const industries = await Industry.findAll({ order: [['created_at', 'DESC']] });
    res.json(industries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateIndustry = async (req, res) => {
  const { id } = req.params;
  const { industry_name } = req.body;
  try {
    const industry = await Industry.findByPk(id);
    if (!industry) return res.status(404).json({ message: 'Industry not found' });
    industry.industry_name = industry_name;
    await industry.save();
    res.json(industry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteIndustry = async (req, res) => {
  const { id } = req.params;
  try {
    const industry = await Industry.findByPk(id);
    if (!industry) return res.status(404).json({ message: 'Industry not found' });
    await industry.destroy();
    res.json({ message: 'Industry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Position ---
exports.createPosition = async (req, res) => {
  const { industry_id, position_name, description } = req.body;
  if (!industry_id || !position_name) return res.status(400).json({ message: 'Required fields missing' });
  const image_position = req.file ? req.file.filename : null;

  try {
    const position = await Position.create({ industry_id, position_name, description, image_position });
    res.status(201).json(position);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPositions = async (req, res) => {
  try {
    const positions = await Position.findAll({
      include: [{ model: Industry, attributes: ['industry_name'] }],
      order: [['created_at', 'DESC']],
    });
    const formatted = positions.map(p => ({
      ...p.toJSON(),
      industry: p.Industry?.industry_name,
      image_url: p.image_position ? `/uploads/positions/${p.image_position}` : null,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePosition = async (req, res) => {
  const { id } = req.params;
  const { industry_id, position_name, description } = req.body;
  const image_position = req.file ? req.file.filename : undefined;

  try {
    const position = await Position.findByPk(id);
    if (!position) return res.status(404).json({ message: 'Position not found' });

    position.industry_id = industry_id;
    position.position_name = position_name;
    position.description = description;
    if (image_position) position.image_position = image_position;

    await position.save();
    res.json(position);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePosition = async (req, res) => {
  const { id } = req.params;
  try {
    const position = await Position.findByPk(id);
    if (!position) return res.status(404).json({ message: 'Position not found' });
    await position.destroy();
    res.json({ message: 'Position deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};