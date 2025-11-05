import Pet from "../models/PetSchema.js";

export const addPet = async (req, res) => {
  try {
    const { name, type, breed, birthDate, weight, sex, notes } = req.body;
    const ownerId = req.userId;

    // Check if an identical pet already exists for this owner
    const existingPet = await Pet.findOne({
      ownerId,
      name,
      type,
      breed,
      birthDate,
      sex,
      weight,
      notes,
    });

    if (existingPet) {
      return res
        .status(400)
        .json({ success: false, message: "This pet record already exists." });
    }

    // If no duplicate, create new one
    const pet = new Pet({
      name,
      type,
      breed,
      birthDate,
      sex,
      weight,
      notes,
      ownerId,
    });

    await pet.save();
    res
      .status(201)
      .json({ success: true, message: "Pet Added Successfully", pet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// View Pets
export const getUserPets = async (req, res) => {
  try {
    const ownerId = req.userId;
    const pets = await Pet.find({ ownerId });
    res.status(200).json({ success: true, pets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//Get Pet By ID
export const getPetById = async (req, res) => {
  try {
    const { petId } = req.params;
    const ownerId = req.userId;

    const pet = await Pet.findOne({ _id: petId, ownerId });

    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet Not Found" });
    }

    res.status(200).json({ success: true, pet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//Update Pet
export const updatePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const ownerId = req.userId;

    const pet = await Pet.findOne({ _id: petId, ownerId });

    if (!pet)
      return res.status(404).json({ success: false, message: "Pet Not Found" });

    Object.assign(pet, req.body);
    await pet.save();

    res
      .status(200)
      .json({ success: true, message: "Pet Updated Successfully", pet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//Delete Pet
export const deletePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const ownerId = req.userId;

    const pet = await Pet.findOneAndDelete({ _id: petId, ownerId });
    if (!pet)
      return res.status(400).json({ success: false, message: "Pet Not Found" });

    res
      .status(200)
      .json({ success: true, message: "Pet Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
