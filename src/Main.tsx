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

  const handleDataTransfer = useCallback(
    (event, dataTransferItemList: DataTransferItemList) => {
      const items: DataTransferItem[] = Array.from(dataTransferItemList);
      console.log(items.map((i) => [i.type, i.kind]));
      const file = items.filter((x) => x.kind === "file")[0];
      const uri = items.find((x) => x.type === "text/uri-list");
      if (file) {
        event.preventDefault();
        const blob = file.getAsFile();
        const dataUrl = URL.createObjectURL(blob);
        setImageUrl(dataUrl);
        return true;
      }
      if (uri) {
        event.preventDefault();
        uri.getAsString(setImageUrl);
        return true;
      }
      return false;
    },
    [setImageUrl]
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

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setWidth(imgRef.current.width.toString());
      setHeight(imgRef.current.height.toString());
    }
  }, [imgRef]);

  const handleImageError = useCallback(() => {
    console.log(imageUrl);
    setImageUrl(undefined);
    toast({
      title: "Error loading image",
      description: (
        <>
          <p>Failed to load image from the clipboard content.</p>
          <p>
            Check you pasted an image or a URL to an image. Try copy/paste from
            a browser tab if the image is in an anchor, as drag and drop will
            give the href instead.
          </p>
        </>
      ),
      status: "error",
      isClosable: true,
    });
  }, [toast, imageUrl, setImageUrl]);

  return (
    <Box padding={10} onDragOver={handleDragOver} onDrop={handleDrop} onPaste={handlePaste} minHeight="100vh">
      <Container maxWidth="70ch">
        <Stack marginBottom={8} spacing={2}>
          <Flex alignItems="flex-end" marginBottom={2}>
            <Image display="inline" height="9rem" src={icon} />
            <Heading paddingLeft={2} paddingBottom={4}>
              Aspect ratio calculator
            </Heading>
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
