/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import { useEffect, useState } from 'react';

export default function FileUpload({ form, setFileText }: any) {

  return (
    <FilePond
      server={{
        process: {
          url: '/api/uploadnotort',
          method: 'POST',
          // withCredentials: false,
          // headers: {},
          // timeout: 7000,
          onload: (response: any) => {
            // Parse and handle the server's response
            const parsedResponse = JSON.parse(response);
            // console.log('Server Response:', parsedResponse);
            setFileText(parsedResponse); // Pass parsed text to parent component or state
            return parsedResponse; // Return the parsed text
          },
          onerror: (error) => {
            console.error('File upload error:', error);
          },
        },
        fetch: null,
        revert: null,
      }}
    />
  );
}
