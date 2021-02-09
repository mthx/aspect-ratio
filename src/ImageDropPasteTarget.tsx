import { useToast } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { UrlSource, FileUrlSource, DefaultUrlSource } from "./urlSource";

interface ImageDropPasteTargetProps {
  onNewImageUrlSource: (source: UrlSource) => void;
  children: React.ReactElement;
}

const ImageDropPasteTarget = ({
  children,
  onNewImageUrlSource,
}: ImageDropPasteTargetProps) => {
  const toast = useToast();

  const handleDataTransfer = useCallback(
    (event, dataTransferItemList: DataTransferItemList) => {
      const items: DataTransferItem[] = Array.from(dataTransferItemList);
      const file = items.find((x) => x.kind === "file");
      const uri = items.find((x) => x.type === "text/uri-list");
      if (file) {
        event.preventDefault();
        onNewImageUrlSource(new FileUrlSource(file.getAsFile()!));
        return true;
      }
      if (uri) {
        event.preventDefault();
        uri.getAsString((url) =>
          onNewImageUrlSource(new DefaultUrlSource(url))
        );
        return true;
      }
      return false;
    },
    [onNewImageUrlSource]
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const items: DataTransferItemList = event.clipboardData.items;
      handleDataTransfer(event, items);
    },
    [handleDataTransfer]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      // Always preventDefault to avoid opening opening tabs if we don't match.
      event.preventDefault();
      if (!handleDataTransfer(event, event.dataTransfer.items)) {
        toast({
          title: "Unrecognised item dropped on page",
          description:
            "Drop an image URL, for example from another browser tab.",
          status: "warning",
          isClosable: true,
        });
      }
    },
    [toast, handleDataTransfer]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    []
  );

  return React.cloneElement(children, {
    onDrop: handleDrop,
    onPaste: handlePaste,
    onDragOver: handleDragOver,
  });
};

export default ImageDropPasteTarget;
