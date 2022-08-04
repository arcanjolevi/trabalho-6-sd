import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Textarea,
  useToast,
} from "@chakra-ui/react";

import { useState } from "react";
import { MdOutlineContentCopy, MdOutlineSimCardDownload } from "react-icons/md";

import {
  generatePair,
  importPrivateKey,
  importPublicKey,
  sign,
} from "./utils/rsa";

const style = {
  height: "70px",
  alignItems: "center",
  width: "25%",
  justifyContent: "center",
  _hover: { opacity: 0.5 },
  cursor: "pointer",
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: "500",
  padding: "10px",
  textAlign: "center",
};

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
        width={"800px"}
        padding={"10px"}
        boxShadow="rgba(0, 0, 0, 0.24) 0px 3px 8px;"
        borderRadius={"10px"}
        minHeight="200px"
        flexDirection={"column"}
      >
        <Flex
          width={"100%"}
          height="70px"
          alignItems={"center"}
          justifyContent="space-between"
          background={"#cccccc"}
        >
          <Tab
            onClick={() => setActiveTab(0)}
            borderBottom={
              activeTab === 0 ? "3px solid #385898" : "3px solid #cecece"
            }
          >
            Gerar Chaves
          </Tab>
          <Tab
            onClick={() => setActiveTab(1)}
            borderBottom={
              activeTab === 1 ? "3px solid #385898" : "3px solid #cecece"
            }
          >
            Criptografar Arquivo
          </Tab>
          <Tab
            onClick={() => setActiveTab(2)}
            borderBottom={
              activeTab === 2 ? "3px solid #385898" : "3px solid #cecece"
            }
          >
            Descriptografar Arquivo
          </Tab>

          <Tab
            borderBottom={
              activeTab === 3 ? "3px solid #385898" : "3px solid #cecece"
            }
            onClick={() => setActiveTab(3)}
          >
            Assinar Documento
          </Tab>

          <Tab
            borderBottom={
              activeTab === 4 ? "3px solid #385898" : "3px solid #cecece"
            }
            onClick={() => setActiveTab(4)}
          >
            Assinar Documento
          </Tab>
        </Flex>

        {activeTab === 0 && <Generator />}
        {activeTab === 1 && <FileCripto />}
        {activeTab === 2 && <FileDesCripto />}
        {activeTab === 3 && <FileSign />}
      </Flex>
    </Flex>
  );
}

const FileSign = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File>();

  async function signFile() {
    try {
      const data = await sign(privateKey, message, name, email);

      if (file) {
        generateFile(`signed_${file.name}`, data);
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Flex w="100%" padding={"30px"} flexDirection="column">
      <h1>Nome</h1>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        marginBottom={"20px"}
      ></Input>

      <h1>Email</h1>
      <Input
        value={email}
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        marginBottom={"20px"}
      ></Input>

      <h1>Chave Privada</h1>
      <Input
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            const reader = new FileReader();
            reader.readAsText(e.target.files[0], "UTF-8");
            reader.onload = (evt) => {
              setPrivateKey((evt.target?.result as string) || "");
            };
          }
        }}
        marginBottom={"20px"}
        type={"file"}
      ></Input>

      <h1>Arquivo a ser Assinado</h1>
      <Input marginBottom={"20px"} type={"file"}></Input>

      <Button onClick={signFile} colorScheme={"facebook"}>
        Assinar Aquivo
      </Button>
    </Flex>
  );
};

const Tab = ({ children, ...props }: any) => {
  return (
    <Flex
      background={"#FFF"}
      height={"70px"}
      alignItems="center"
      width={"19.85%"}
      justifyContent="center"
      _hover={{ opacity: 0.5 }}
      cursor="pointer"
      fontFamily="'Montserrat', sans-serif"
      fontWeight={"500"}
      padding="10px"
      textAlign="center"
      {...props}
    >
      {children}
    </Flex>
  );
};

const FileCripto = () => {
  const [publicKey, setPublicKey] = useState("");
  const [messageA, setMessageA] = useState<ArrayBuffer>();
  const [file, setFile] = useState<File>();
  const toast = useToast();

  async function encrypt() {
    if (messageA && file) {
      try {
        const key = await importPublicKey(publicKey);
        const data = await window.crypto.subtle.encrypt(
          {
            name: "RSA-OAEP",
          },
          key,
          messageA
        );
        generateFromBuffer(`encript_${file?.name}`, data);
      } catch (error) {
        console.log(error);
        toast({
          title: "Verifique seus dados",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Verifique seus dados",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }
  return (
    <Flex w="100%" padding={"30px"} flexDirection="column">
      <>
        <h1>Carregue uma arquivo com a chave pública</h1>
        <Input
          onChange={async (e) => {
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

      <h1>Carregue arquivo a ser criptografado</h1>
      <Input
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0) {
            setMessageA(await e.target.files[0].arrayBuffer());
            setFile(e.target.files[0]);
          }
        }}
        marginY={"5px"}
        type={"file"}
      ></Input>

      <Button onClick={encrypt} marginY="30px" colorScheme={"facebook"}>
        Criptografar Arquivo
      </Button>
    </Flex>
  );
};

const FileDesCripto = () => {
  const [privateKey, setPrivateKey] = useState("");
  const [messageA, setMessageA] = useState<ArrayBuffer>();
  const [file, setFile] = useState<File>();
  const toast = useToast();

  async function decrypt() {
    try {
      if (file && messageA) {
        const key = await importPrivateKey(privateKey);
        const data = await window.crypto.subtle.decrypt(
          {
            name: "RSA-OAEP",
          },
          key,
          messageA
        );
        generateFromBuffer(`decrypt_${file?.name}`, data);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Verifique seus dados",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }
  return (
    <Flex w="100%" padding={"30px"} flexDirection="column">
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

      <h1>Carregue arquivo a ser descriptografado</h1>
      <Input
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0) {
            setMessageA(await e.target.files[0].arrayBuffer());
            setFile(e.target.files[0]);
          }
        }}
        marginY={"5px"}
        type={"file"}
      ></Input>

      <Button onClick={decrypt} marginY="30px" colorScheme={"facebook"}>
        Descriptografar Arquivo
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

    try {
      const keys = await generatePair();
      setPublicKey(keys.publicKey);
      setPrivateKey(keys.privateKey);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Flex w="100%" padding={"30px"} flexDirection="column">
      <h1>Chave Privada</h1>
      <Box position={"relative"}>
        <Textarea
          readOnly
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
          readOnly
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
            onClick={() => generateFile("public_key.pem", publicKey)}
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

function generateFromBuffer(filename: string, buffer: ArrayBuffer) {
  const link = document.createElement("a");
  link.style.display = "none";
  document.body.appendChild(link);

  const blob = new Blob([buffer], { type: "text/plain" });
  const objectURL = URL.createObjectURL(blob);

  link.href = objectURL;
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
}
