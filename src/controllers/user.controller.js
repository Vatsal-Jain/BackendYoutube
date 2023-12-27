import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user detail from client
  const { email, password, fullName, avatar, username } = req.body;
  console.log(fullName, email, password, avatar);

  //validation

  if (
    [fullName, email, password, avatar].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are Required");
  }

  //check if user already exists :  email
  const existedUser = User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (existedUser) {
    throw new ApiError(409, "Email or Username has been used");
  }
  // check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is requried");
  }

  // if (!coverImageLocalPath) {
  //   throw new ApiError(400, "Cover Image is requried");
  // }

  // upload them to cloudinary, avatar
  const avatarImageResponseFromCloudinary =
    await uploadOnCloudinary(avatarLocalPath);
  const coverImageResponseFromCloudinary =
    await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarImageResponseFromCloudinary) {
    throw new ApiError(400, "Avatar Response From Cloudinary is requried");
  }

  // if (!coverImageResponseFromCloudinary) {
  //   throw new ApiError(400, "Cover Image Response From Cloudinary is requried");
  // }

  // create user object - create entry in db

  const user = await User.create({
    email: email,
    fullName: fullName,
    avatar: avatarImageResponseFromCloudinary?.url,
    coverImage: coverImageResponseFromCloudinary?.url || "",
    username: username.toLowerCase(),
    password: password,
  });

  //remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the account");
  }
  // return res

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "Account Created Successfully"));
});

export { registerUser };
