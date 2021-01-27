import React from "react";
import "./App.css";
import {
  ChakraProvider,
} from "@chakra-ui/react";
import Main from "./Main";

const App = () => (
  <ChakraProvider>
    <Main />
  </ChakraProvider>
);

export default App;
