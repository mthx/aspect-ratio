import { Button, Input } from "@chakra-ui/react";
import React, { useCallback, useRef } from "react";

interface FileUploadButtonProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadButton = ({ onChange }: FileUploadButtonProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const handleUpload = useCallback(() => {
    ref.current && ref.current.click();
  }, []);
  return (
    <>
      <Input
        type="file"
        accept="image/*"
        display="none"
        ref={ref}
        onChange={onChange}
      />
      <Button alignSelf="center" onClick={handleUpload}>
        Upload an image
      </Button>
    </>
  );
};

export default FileUploadButton;
