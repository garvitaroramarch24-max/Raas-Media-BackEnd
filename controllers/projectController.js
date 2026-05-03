
const Project = require('../models/Project');
const cloudinary = require('../utils/cloudinary');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Create project (with Cloudinary image upload)
exports.createProject = async (req, res) => {
  try {
    const { title, description, category, image } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let imageUrl = image;

    // If image is a base64 string or file upload, upload to Cloudinary
    if (image && image.startsWith('data:')) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: 'raas-media-projects',
        resource_type: 'image',
      });
      imageUrl = uploadRes.secure_url;
    }

    const project = new Project({
      title,
      description,
      category: category || 'live',
      image: imageUrl,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get projects by category
exports.getProjectsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const projects = await Project.find({ category }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
