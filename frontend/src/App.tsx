import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
  useToast,
} from "@chakra-ui/react";

import axios from "axios";
import rsa from "node-rsa";
import { useState } from "react";
import { MdOutlineContentCopy, MdOutlineSimCardDownload } from "react-icons/md";
import { api_url } from "./services";

function App() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <Flex
      w="100vw"
      minHeight={"100vh"}
      paddingTop={"15vh"}
      alignItems="flex-start"
      justifyContent={"center"}
    >
      <Flex
        width={"700px"}
        padding={"10px"}
        boxShadow="rgba(0, 0, 0, 0.24) 0px 3px 8px;"
        borderRadius={"10px"}
        minHeight="200px"
        flexDirection={"column"}
      >
        <Flex
          width={"100%"}
          height="40px"
          alignItems={"center"}
          justifyContent="space-between"
        >
          <Flex
            width={"33.30%"}
            justifyContent="center"
            _hover={{ opacity: 0.5 }}
            cursor="pointer"
            borderBottom={
              activeTab === 0 ? "3px solid #385898" : "3px solid #cecece"
            }
            fontFamily="'Montserrat', sans-serif"
            fontWeight={"500"}
            padding="10px"
            onClick={() => setActiveTab(0)}
          >
            Gerar Chaves
          </Flex>
          <Flex
            width={"33.30%"}
            justifyContent="center"
            _hover={{ opacity: 0.5 }}
            cursor="pointer"
            borderRight={"1px solid #c0c0c0"}
            borderLeft={"1px solid #c0c0c0"}
            borderBottom={
              activeTab === 1 ? "3px solid #385898" : "3px solid #cecece"
            }
            fontFamily="'Montserrat', sans-serif"
            fontWeight={"500"}
            padding="10px"
            onClick={() => setActiveTab(1)}
          >
            Criptografar Arquivo
          </Flex>
          <Flex
            width={"33.30%"}
            justifyContent="center"
            _hover={{ opacity: 0.5 }}
            cursor="pointer"
            borderBottom={
              activeTab === 2 ? "3px solid #385898" : "3px solid #cecece"
            }
            fontFamily="'Montserrat', sans-serif"
            fontWeight={"500"}
            padding="10px"
            onClick={() => setActiveTab(2)}
          >
            Descriptografar Arquivo
          </Flex>
        </Flex>

        {activeTab === 0 && <Generator />}
        {activeTab === 1 && <FileCripto />}
        {activeTab === 2 && <FileDesCripto />}
      </Flex>
    </Flex>
  );
}

const FileCripto = () => {
  const [keyType, setKeyType] = useState(-1);
  const [publicKey, setPublicKey] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File>();

  async function encrypt() {
    try {
      const r = await axios.post(api_url + "encrypt", {
        publicKey,
        message,
      });

      if (file) {
        generateFile(file.name, r.data.encrypted);
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Flex w="100%" padding={"30px"} flexDirection="column">
      <Flex marginBottom={"20px"} gap={"10px"}>
        <Button
          onClick={() => setKeyType(0)}
          colorScheme={keyType === 0 ? "facebook" : "gray"}
        >
          Inserir chave manualmente
        </Button>

        <Button
          onClick={() => setKeyType(1)}
          colorScheme={keyType === 1 ? "facebook" : "gray"}
        >
          Carregar arquivo com chave
        </Button>
      </Flex>
      {keyType === 0 && (
        <>
          <h1>Insira uma Chave Pública</h1>
          <Input marginBottom={"10px"}></Input>
        </>
      )}

      {keyType === 1 && (
        <>
          <h1>Carregue uma arquivo com a chave pública</h1>
          <Input
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const reader = new FileReader();
                reader.readAsText(e.target.files[0], "UTF-8");
                reader.onload = (evt) => {
                  setPublicKey((evt.target?.result as string) || "");
                };
              }
            }}
            marginY={"5px"}
            type={"file"}
          ></Input>
        </>
      )}

      {keyType !== -1 && (
        <>
          <h1>Carregue arquivo a ser criptografado</h1>
          <Input
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
                const reader = new FileReader();
                reader.readAsText(e.target.files[0], "UTF-8");
                reader.onload = (evt) => {
                  setMessage(evt.target?.result as string);
                };
              }
            }}
            marginY={"5px"}
            type={"file"}
          ></Input>
        </>
      )}

      <Button onClick={encrypt} marginY="30px" colorScheme={"facebook"}>
        Criptografar
      </Button>
    </Flex>
  );
};

const FileDesCripto = () => {
  const [keyType, setKeyType] = useState(-1);
  const [privateKey, setPrivateKey] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File>();

  async function decrypt() {
    try {
      const r = await axios.post(api_url + "decrypt", {
        privateKey,
        message,
      });

      if (file) {
        generateFile(file.name, r.data.decrypted);
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Flex w="100%" padding={"30px"} flexDirection="column">
      <Flex marginBottom={"20px"} gap={"10px"}>
        <Button onClick={() => setKeyType(0)} colorScheme={"facebook"}>
          Inserir chave manualmente
        </Button>

        <Button onClick={() => setKeyType(1)} colorScheme={"facebook"}>
          Carregar arquivo com chave
        </Button>
      </Flex>
      {keyType === 0 && (
        <>
          <h1>Insira uma Chave Privada</h1>
          <Input
            onChange={(e) => setPrivateKey(e.target.value)}
            marginBottom={"10px"}
          ></Input>
        </>
      )}

      {keyType === 1 && (
        <>
          <h1>Carregue uma arquivo com a chave Privada</h1>
          <Input
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const reader = new FileReader();
                reader.readAsText(e.target.files[0], "UTF-8");
                reader.onload = (evt) => {
                  setPrivateKey(evt.target?.result as string);
                };
              }
            }}
            marginY={"5px"}
            type={"file"}
          ></Input>
        </>
      )}

      {keyType !== -1 && (
        <>
          <h1>Carregue arquivo a ser descriptografado</h1>
          <Input
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
                const reader = new FileReader();
                reader.readAsText(e.target.files[0], "UTF-8");
                reader.onload = (evt) => {
                  setMessage(evt.target?.result as string);
                };
              }
            }}
            marginY={"5px"}
            type={"file"}
          ></Input>
        </>
      )}

      <Button onClick={decrypt} marginY="30px" colorScheme={"facebook"}>
        Descriptografar
      </Button>
    </Flex>
  );
};

const Generator = () => {
  const toast = useToast();
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");

  function copy(text: string) {
    toast({
      title: "Chave Copiada",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    navigator.clipboard.writeText(text);
  }

  async function generateKeys() {
    setPublicKey("");
    setPrivateKey("");
    const { keys } = (await axios.get(api_url + "keys-rsa")).data;
    setPublicKey(keys.publicKey);
    setPrivateKey(keys.privateKey);
  }
  return (
    <Flex w="100%" padding={"30px"} flexDirection="column">
      <h1>Chave Privada</h1>
      <Box position={"relative"}>
        <Textarea
          value={privateKey}
          marginBottom={"5px"}
          height="60px"
        ></Textarea>
        <Flex width="100%" justifyContent={"flex-end"}>
          <Box
            _hover={{ opacity: 0.5 }}
            onClick={() => copy(privateKey)}
            cursor={"pointer"}
          >
            <MdOutlineContentCopy size={30} color="#808080" />
          </Box>

          <Box
            _hover={{ opacity: 0.5 }}
            onClick={() => generateFile("private_key.pem", privateKey)}
            cursor={"pointer"}
          >
            <MdOutlineSimCardDownload size={30} color="#808080" />
          </Box>
        </Flex>
      </Box>
      <h1>Chave Pública</h1>

      <Box position={"relative"} marginBottom="10px">
        <Textarea
          value={publicKey}
          paddingRight="40px"
          marginBottom={"5px"}
          height="60px"
        ></Textarea>
        <Flex width="100%" justifyContent={"flex-end"}>
          <Box
            _hover={{ opacity: 0.5 }}
            onClick={() => copy(publicKey)}
            cursor={"pointer"}
          >
            <MdOutlineContentCopy size={30} color="#808080" />
          </Box>

          <Box
            _hover={{ opacity: 0.5 }}
            onClick={() => generateFile("public_key.pem", privateKey)}
            cursor={"pointer"}
          >
            <MdOutlineSimCardDownload size={30} color="#808080" />
          </Box>
        </Flex>
      </Box>
      <Divider />
      <Button
        onClick={generateKeys}
        marginTop={"10px"}
        colorScheme={"facebook"}
      >
        Gerar Par de Chaves
      </Button>
    </Flex>
  );
};

export default App;

function generateFile(filename: string, text: string) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
