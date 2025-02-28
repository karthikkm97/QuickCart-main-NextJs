import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import cloudinary from "cloudinary";
import { NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    // Check if user is authorized
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Not Authorized" });
    }

    // Parse form data
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");

    const files = formData.getAll("images");

    // Validate file input
    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No File Selected",
      });
    }

    // Connect to database before operations
    await connectDB();

    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          return new Promise((resolve, reject) => {
            const stream = cloudinary.v2.uploader.upload_stream(
              { resource_type: "auto" },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary Upload Error:", error);
                  reject(error);
                } else {
                  resolve(result.secure_url);
                }
              }
            );
            stream.end(buffer);
          });
        } catch (error) {
          console.error("File Processing Error:", error);
          throw error;
        }
      })
    );

    // Create a new product
    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      image: imageUrls, // Use the uploaded image URLs
      date: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Product Uploaded Successfully",
      newProduct,
    });
  } catch (error) {
    console.error("Error in Product Upload:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
