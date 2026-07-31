import HotelProfile from "../models/HotelProfile.js";

/**
 * GET /api/hotel-profile
 * Fetch the single hotel profile document. Creates a default document if none exists.
 */
export const getHotelProfile = async (req, res, next) => {
  try {
    let profile = await HotelProfile.findOne();
    if (!profile) {
      profile = await HotelProfile.create({});
    }
    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/hotel-profile
 * Create or update the single hotel profile document.
 */
export const createHotelProfile = async (req, res, next) => {
  try {
    let profile = await HotelProfile.findOne();
    if (profile) {
      Object.assign(profile, req.body);
      await profile.save();
    } else {
      profile = await HotelProfile.create(req.body);
    }

    return res.status(200).json({
      success: true,
      message: "Hotel profile saved successfully",
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/hotel-profile
 * Update the single hotel profile document.
 */
export const updateHotelProfile = async (req, res, next) => {
  try {
    let profile = await HotelProfile.findOne();
    if (!profile) {
      profile = await HotelProfile.create(req.body);
    } else {
      Object.assign(profile, req.body);
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: "Hotel profile updated successfully",
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};
