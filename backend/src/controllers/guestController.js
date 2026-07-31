import mongoose from "mongoose";
import Guest from "../models/Guest.js";

/**
 * GET /api/guests
 * Fetch all guests, sorted by newest first
 */
export const getGuests = async (req, res, next) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: guests.length,
      data: guests,
      guests, // for backwards/varied API convention compatibility
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/guests/:id
 * Get single guest by ID
 */
export const getGuestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }

    const guest = await Guest.findById(id);
    if (!guest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }

    return res.status(200).json({ success: true, data: guest, guest });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/guests
 * Create a new guest record with duplicate checks for email, phone, idProofNumber
 */
export const createGuest = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      nationality,
      gender,
      dateOfBirth,
      idProofType,
      idProofNumber,
      emergencyContact,
      notes,
      totalVisits,
      totalSpent,
      lastStayDate,
    } = req.body;

    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({ success: false, message: "Full name is required" });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }
    if (!idProofNumber || !String(idProofNumber).trim()) {
      return res.status(400).json({ success: false, message: "ID proof number is required" });
    }

    const cleanedEmail = String(email).trim().toLowerCase();
    const cleanedPhone = String(phone).trim();
    const cleanedIdProof = String(idProofNumber).trim();

    // Check duplicate email
    const existingEmail = await Guest.findOne({ email: cleanedEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "A guest with this email already exists" });
    }

    // Check duplicate phone
    const existingPhone = await Guest.findOne({ phone: cleanedPhone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: "A guest with this phone number already exists" });
    }

    // Check duplicate ID proof
    const existingIdProof = await Guest.findOne({ idProofNumber: cleanedIdProof });
    if (existingIdProof) {
      return res.status(400).json({ success: false, message: "A guest with this ID proof number already exists" });
    }

    const guest = await Guest.create({
      fullName: String(fullName).trim(),
      email: cleanedEmail,
      phone: cleanedPhone,
      address: address ? String(address).trim() : "",
      nationality: nationality ? String(nationality).trim() : "",
      gender: gender || "",
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      idProofType: idProofType || "nationalId",
      idProofNumber: cleanedIdProof,
      emergencyContact: emergencyContact ? String(emergencyContact).trim() : "",
      notes: notes ? String(notes).trim() : "",
      totalVisits: typeof totalVisits === "number" ? Math.max(0, totalVisits) : 0,
      totalSpent: typeof totalSpent === "number" ? Math.max(0, totalSpent) : 0,
      lastStayDate: lastStayDate ? new Date(lastStayDate) : null,
    });

    return res.status(201).json({
      success: true,
      message: "Guest created successfully",
      data: guest,
      guest,
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({
        success: false,
        message: `A guest with this ${field} already exists`,
      });
    }
    next(err);
  }
};

/**
 * PUT /api/guests/:id
 * Update an existing guest record with duplicate checks
 */
export const updateGuest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }

    const {
      fullName,
      email,
      phone,
      address,
      nationality,
      gender,
      dateOfBirth,
      idProofType,
      idProofNumber,
      emergencyContact,
      notes,
      totalVisits,
      totalSpent,
      lastStayDate,
    } = req.body;

    const existingGuest = await Guest.findById(id);
    if (!existingGuest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }

    // Duplicate checks for email, phone, idProofNumber if provided
    if (email) {
      const cleanedEmail = String(email).trim().toLowerCase();
      const conflictEmail = await Guest.findOne({ email: cleanedEmail, _id: { $ne: id } });
      if (conflictEmail) {
        return res.status(400).json({ success: false, message: "A guest with this email already exists" });
      }
    }

    if (phone) {
      const cleanedPhone = String(phone).trim();
      const conflictPhone = await Guest.findOne({ phone: cleanedPhone, _id: { $ne: id } });
      if (conflictPhone) {
        return res.status(400).json({ success: false, message: "A guest with this phone number already exists" });
      }
    }

    if (idProofNumber) {
      const cleanedIdProof = String(idProofNumber).trim();
      const conflictId = await Guest.findOne({ idProofNumber: cleanedIdProof, _id: { $ne: id } });
      if (conflictId) {
        return res.status(400).json({ success: false, message: "A guest with this ID proof number already exists" });
      }
    }

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = String(fullName).trim();
    if (email !== undefined) updateFields.email = String(email).trim().toLowerCase();
    if (phone !== undefined) updateFields.phone = String(phone).trim();
    if (address !== undefined) updateFields.address = String(address).trim();
    if (nationality !== undefined) updateFields.nationality = String(nationality).trim();
    if (gender !== undefined) updateFields.gender = gender;
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (idProofType !== undefined) updateFields.idProofType = idProofType;
    if (idProofNumber !== undefined) updateFields.idProofNumber = String(idProofNumber).trim();
    if (emergencyContact !== undefined) updateFields.emergencyContact = String(emergencyContact).trim();
    if (notes !== undefined) updateFields.notes = String(notes).trim();
    if (totalVisits !== undefined) updateFields.totalVisits = Math.max(0, Number(totalVisits));
    if (totalSpent !== undefined) updateFields.totalSpent = Math.max(0, Number(totalSpent));
    if (lastStayDate !== undefined) updateFields.lastStayDate = lastStayDate ? new Date(lastStayDate) : null;

    const guest = await Guest.findByIdAndUpdate(id, updateFields, {
      returnDocument: "after",
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Guest updated successfully",
      data: guest,
      guest,
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({
        success: false,
        message: `A guest with this ${field} already exists`,
      });
    }
    next(err);
  }
};

/**
 * DELETE /api/guests/:id
 * Delete guest record
 */
export const deleteGuest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }

    const guest = await Guest.findById(id);
    if (!guest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }

    await Guest.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Guest deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
