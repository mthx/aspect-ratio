import React, { useCallback, useRef, useState } from "react";
import {
  AspectRatio,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  Kbd,
  Link,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import icon from "./icon.svg";
import { FileUrlSource, useUrlSourceState } from "./urlSource";
import ImageDropPasteTarget from "./ImageDropPasteTarget";
import AspectInfo from "./AspectInfo";
import NumericInput from "./NumericInput";
import FileUploadButton from "./FileUploadButton";

const Main = () => {
  const [width, setWidth] = useState("1600");
  const [height, setHeight] = useState("900");
  const [imageUrl, setImageUrl] = useUrlSourceState();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const toast = useToast();

  const handleSelectFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        const file = files.item(0);
        if (file) {
          setImageUrl(new FileUrlSource(file));
        }
      }
    },
    [setImageUrl]
  );

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
      description: (
        <>
          <Text>Failed to load image from the clipboard content.</Text>
          <Text>
            Check you pasted an image or a URL to an image. Try copy/paste from
            a browser tab if the image is in an anchor, as drag and drop will
            give the href instead.
          </Text>
        </>
      ),
      status: "error",
      isClosable: true,
    });
  }, [toast, setImageUrl]);

  return (
    <ImageDropPasteTarget onNewImageUrlSource={setImageUrl}>
      <Stack minHeight="100vh" color="black">
        <Container padding={[1, 4, 6, 10]} maxWidth="xl" flexGrow={1}>
          <Stack marginBottom={8} spacing={2}>
            <Flex alignItems="flex-end" marginBottom={2}>
              <Image display="inline" width={36} height={36} src={icon} />
              <Heading paddingLeft={2} paddingBottom={4}>
                Aspect ratio calculator
              </Heading>
            </Flex>
            <Text>
              Find the aspect ratio from an image. Shows approximate aspect
              ratios where things aren't quite right and the closest ratio
              commonly used on the web.
            </Text>
            <Box paddingBottom={2} display="flex" justifyContent="center">
              <FileUploadButton onChange={handleSelectFile} />
            </Box>
            <Text>
              Or use <Kbd>{isMac() ? "Cmd" : "Ctrl"}</Kbd> + <Kbd>V</Kbd> to
              paste an image or URL, drag and drop an image onto the page, or
              type in dimensions.
            </Text>
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
              <Image
                display="block"
                mr="auto"
                ml="auto"
                alt=""
                src={imageUrl.url}
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
              <Box bg="grey" justifyContent="center" alignItems="center">
                <AspectInfo
                  width={parseInt(width, 10)}
                  height={parseInt(height, 10)}
                />
              </Box>
            </AspectRatio>
          )}
        </Container>
        <Box as="footer" backgroundColor="whitesmoke">
          <Text size="xs" textAlign="center" paddingTop={2} paddingBottom={2}>
            <Link href="http://github.com/mthx/aspect-ratio/">
              Source code on GitHub.
            </Link>
          </Text>
        </Box>
      </Stack>
    </ImageDropPasteTarget>
  );
};

const isMac = () => navigator.platform.indexOf("Mac") !== -1;

const isValid = (n: string) => /^\d+$/.test(n.trim());

export default Main;
