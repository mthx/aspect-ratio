import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import {
  AspectRatio,
  Box,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Heading,
  Image,
  Input,
  Kbd,
  ListItem,
  Stack,
  Text,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import { closest } from "./ratios";
import { findApproximateAspectRatio, Fraction } from "./fraction";
import icon from "./icon.svg";

const Main = () => {
  const [width, setWidth] = useState("1600");
  const [height, setHeight] = useState("900");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const toast = useToast();

  const handlePaste = useCallback(
    (event) => {
      if ((event as any).clipboardData) {
        const items: DataTransferItem[] = Array.from(
          (event as any).clipboardData.items
        );
        const file = items.filter(
          (x: DataTransferItem) => x.kind === "file"
        )[0];
        const text = items.filter(
          (x: DataTransferItem) => x.kind === "string"
        )[0];
        if (file) {
          event.preventDefault();
          const blob = file.getAsFile();
          const dataUrl = URL.createObjectURL(blob);
          setImageUrl(dataUrl);
        } else if (text && event.target.nodeName !== "INPUT") {
          event.preventDefault();
          text.getAsString(setImageUrl);
        }
      }
    },
    [setImageUrl]
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      const items: DataTransferItem[] = Array.from(event.dataTransfer!.items);
      const text = items.find((x: DataTransferItem) => x.kind === "string");
      const uri = items.find(
        (x: DataTransferItem) => x.type === "text/uri-list"
      );
      const value = uri || text;
      // Always preventDefault to avoid opening opening tabs if we don't match.
      event.preventDefault();
      if (value) {
        value.getAsString(setImageUrl);
      } else {
        toast({
          title: "Unrecognised item dropped on page",
          description:
            "Drop an image URL, for example from another browser tab.",
          status: "warning",
          isClosable: true,
        });
      }
    },
    [toast, setImageUrl]
  );

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer!.dropEffect = "copy";
  }, []);

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setWidth(imgRef.current.width.toString());
      setHeight(imgRef.current.height.toString());
    }
  }, [imgRef]);

  const handleImageError = useCallback(() => {
    setImageUrl(undefined);
    toast({
      title: "Error loading image",
      description:
        "Failed to load image from the clipboard content. Check you pasted an image or a URL to an image.",
      status: "error",
      isClosable: true,
    });
  }, [toast, setImageUrl]);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    document.body.addEventListener("dragover", handleDragOver);
    document.body.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("paste", handlePaste);
      document.body.removeEventListener("dragover", handleDragOver);
      document.body.removeEventListener("drop", handleDrop);
    };
  });

  return (
    <Box padding={10}>
      <Container maxWidth="70ch">
        <Stack marginBottom={8} spacing={2}>
          <Flex alignItems="flex-end" marginBottom={2}>
            <Image display="inline" height="9rem" src={icon} /><Heading paddingLeft={2} paddingBottom={4}>Aspect ratio calculator</Heading>
          </Flex>
          <Text>Find the closest aspect ratio for an image.</Text>
          <UnorderedList spacing={1} listStylePosition="inside">
            <ListItem>
              Drop an image onto the page. Works great from other apps or
              browser windows.
            </ListItem>
            <ListItem>
              Use <Kbd>{isMac() ? "Cmd" : "Ctrl"}</Kbd> + <Kbd>V</Kbd> to paste
              an image or URL.
            </ListItem>
            <ListItem>Type in the dimensions below.</ListItem>
          </UnorderedList>
        </Stack>
        <Grid templateColumns="repeat(2, 1fr)" gap={4} marginBottom={4}>
          <NumericInput
            id="width"
            label="Width"
            value={width}
            onChange={(v) => {
              setImageUrl(undefined);
              setWidth(v);
            }}
          />
          <NumericInput
            id="height"
            label="Height"
            value={height}
            onChange={(v) => {
              setImageUrl(undefined);
              setHeight(v);
            }}
          />
        </Grid>
        <Box marginBottom={4}>
          {imageUrl && (
            <img
              style={{
                display: "block",
                maxWidth: "100%",
                marginRight: "auto",
                marginLeft: "auto",
              }}
              alt=""
              src={imageUrl}
              ref={imgRef}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </Box>
        {isValid(width) && isValid(height) && (
          <AspectRatio
            maxW="100%"
            ratio={parseInt(width, 10) / parseInt(height, 10)}
            marginBottom={4}
          >
            <Box bg="lightgrey" justifyContent="center" alignItems="center">
              <AspectInfo
                width={parseInt(width, 10)}
                height={parseInt(height, 10)}
              />
            </Box>
          </AspectRatio>
        )}
      </Container>
    </Box>
  );
};

interface NumericInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const NumericInput = ({ id, label, value, onChange }: NumericInputProps) => (
  <FormControl id={id}>
    <FormLabel>{label}</FormLabel>
    <Input
      type="number"
      value={value}
      onChange={(v) => onChange(v.currentTarget.value)}
    />
    <FormHelperText>
      The {label.toLowerCase()} of your image in pixels
    </FormHelperText>
  </FormControl>
);

interface AspectInfoItemProps {
  label: string;
  value: Fraction;
  error?: number;
}

const AspectInfoItem = ({ label, value, error }: AspectInfoItemProps) => (
  <Box>
    {label} <span>{value.toString().replace("/", ":")}</span>
    {error && <span> ({(error * 100).toFixed(2)}% error)</span>}
  </Box>
);

interface AspectInfoProps {
  width: number;
  height: number;
}

const AspectInfo = ({ width, height }: AspectInfoProps) => {
  const value = new Fraction(width, height);
  const approx = findApproximateAspectRatio(value);
  const common = closest(value);
  return (
    <Box fontSize={18} color="white" fontWeight="700">
      <AspectInfoItem label="Exactly" value={value} />
      {approx.fraction.compareTo(value) !== 0 && (
        <AspectInfoItem
          label="Approx."
          value={approx.fraction}
          error={approx.error}
        />
      )}
      {common.fraction.compareTo(value) !== 0 && (
        <AspectInfoItem
          label="Closest common is "
          value={common.fraction}
          error={common.error}
        />
      )}
    </Box>
  );
};

const isValid = (n: string) => /^\d+$/.test(n.trim());

const isMac = () => navigator.platform.indexOf("Mac") !== -1;

export default Main;
