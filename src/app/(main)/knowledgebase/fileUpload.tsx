"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storage } from "@/db/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface FileUploadClientProps {
  userId: string;
  isSubscribed: boolean;
}

interface UploadedFile {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export default function FileUploadClient({
  userId,
  isSubscribed,
}: FileUploadClientProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [progress, setProgress] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10 MB

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);

    const newProgress = [...progress];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;
      try {
        const fileUrl = await uploadFile(file, tags[i], (prog: number) => {
          newProgress[i] = prog;
          setProgress([...newProgress]);
        });

        // Extract text from the PDF
        const extractedText = await extractTextFromPDF(file);

        await saveFileMetadata({ userId, fileName, fileUrl, extractedText });
      } catch (error) {
        console.error("Error during file upload or metadata saving:", error);
        alert("Failed to upload file: " + fileName);
        return; // Stop further uploads
      }
    }

    setLoading(false);
    setFiles([]);
    setTags([]);
    fetchUploadedFiles(); // Fetch the list of uploaded files after upload
  };

  const extractTextFromPDF = async (pdfFile: File) => {
    try {
      console.log(`Starting text extraction for PDF: ${pdfFile.name}`);

      const formData = new FormData();
      formData.append("pdfFile", pdfFile);

      const response = await fetch("/api/extract-text-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Extract text error data:", errorData);
        throw new Error(errorData.error || "Failed to extract text from PDF");
      }

      const data = await response.json();
      console.log("Extracted Text Data:", data); // Log the entire data object
      return data.extractedText;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw error;
    }
  };

  const saveExtractedText = async (data: {
    userId: string;
    fileName: string;
    fileUrl: string;
    extractedText: string;
  }) => {
    try {
      const response = await fetch("/api/save-extracted-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Save extracted text error data:", errorData);
        throw new Error("Failed to save extracted text");
      }

      const result = await response.json();
      console.log("Save Result:", result.message); // Log the save result
    } catch (error) {
      console.error("Error saving extracted text:", error);
      throw error;
    }
  };

  const uploadFile = async (
    file: File,
    tag: string,
    onProgress: (progress: number) => void,
  ) => {
    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          console.error("Upload error: ", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at: ", downloadURL);
          resolve(downloadURL);
        },
      );
    });
  };

  const saveFileMetadata = async (metadata: {
    userId: string;
    fileName: string;
    fileUrl: string;
    extractedText: string;
  }) => {
    await fetch("/api/save-file-metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch("/api/get-uploaded-files");
      if (!response.ok) {
        throw new Error("Failed to fetch uploaded files");
      }
      const data = await response.json();
      setUploadedFiles(data);
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);

      if (totalSize > MAX_TOTAL_SIZE) {
        alert("Total upload size exceeds 10 MB. Please select smaller files.");
      } else {
        setFiles(selectedFiles);
        setProgress(new Array(selectedFiles.length).fill(0));
        setTags(new Array(selectedFiles.length).fill("")); // Initialize tags array
      }
    }
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  return (
    <div>
      <div className="mt-8">
        {isSubscribed ? (
          <p className="text-green-600">
            You are subscribed. Enjoy premium features!
          </p>
        ) : (
          <p className="text-red-600">
            You are not subscribed. Subscribe to access premium features.
          </p>
        )}
      </div>
      <form onSubmit={handleFileUpload}>
        <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Input
            type="file"
            onChange={handleFileChange}
            multiple
            className="size-full"
          />
        </div>
        {files.map((file, index) => (
          <div key={index} className="my-4">
            <span>{file.name}</span>
            <Input
              type="text"
              placeholder="Enter a tag"
              value={tags[index]}
              onChange={(e) => handleTagChange(index, e.target.value)}
              className="mt-2"
            />
            <progress value={progress[index]} max="100" className="w-full" />
            <span>{Math.round(progress[index])}%</span>
          </div>
        ))}
        <Button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Submit"}
        </Button>
      </form>

      <div className="mt-8">
        <h2 className="text-2xl">Uploaded Files</h2>
        <ul>
          {uploadedFiles.length > 0 &&
            uploadedFiles.map((file) => (
              <li key={file.id} className="my-2">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.fileName}{" "}
                </a>
                <span>{new Date(file.uploadedAt).toLocaleString()}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
