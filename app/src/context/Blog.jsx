import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as anchor from '@project-serum/anchor'
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAvatarUrl } from "src/functions/getAvatarUrl";
import { getRandomName } from "src/functions/getRandomName";
import idl from 'src/idl.json';
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";


const BlogContext = createContext();


// get program key
const PROGRAM_KEY = new PublicKey(idl.metadata.address);

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("Parent must be wrapped inside PostsProvider");
  }

  return context;
};

export const BlogProvider = ({ children }) => {

  const [user, setUser] = useState();
  const [initialized, setInitialized] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [lastPostId, setLastPostId] = useState(0)
  const [posts, setPosts] = useState([])

  const anchorWallet = useAnchorWallet()
  const {connection} = useConnection(); 
  const {publicKey} = useWallet();

  const program = useMemo(() => {
    if(anchorWallet){
      const provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions());
      return new anchor.Program(idl, PROGRAM_KEY, provider)
    }
  }, [connection, anchorWallet])

  useEffect(() => {
    const start = async () => {
      if(program && publicKey){
        try {
          setTransactionPending(true)
          const [userPta] =  findProgramAddressSync([utf8.encode('user'), publicKey.toBuffer()], program.programId)
          const user = await program.account.userAccount.fetch(userPta);
          if(user){
            setInitialized(true)
            setUser(user)
            setLastPostId(user.lastPostId)
          }

          const postAccount = await program.account.postAccount.all()
          setPosts(postAccount)
        } catch (error) {
            console.log("No user", error)
            setInitialized(false)
        }finally{
          setTransactionPending(false)
        }
      }
    }
    start()
  }, [program, publicKey])


  const nitUser =  async () => {
    if(program && publicKey){
      try {
        setTransactionPending(true)
        const name = getRandomName()
        const avatar = getAvatarUrl(name)
        const [userPta] =  findProgramAddressSync([utf8.encode('user'), publicKey.toBuffer()], program.programId)

        console.log("userPta", userPta)

        await program.methods
          .initUser(name, avatar)
          .accounts({
            userAccount: userPta,
            authority: publicKey,
            SystemProgram: SystemProgram.programId
          }).rpc()
          setInitialized(true)

      } catch (error) {
        console.log(error)
      }finally{
        setTransactionPending(false)
      }
    }
  }

  const createPost = async (title, content) => {

    if(program && publicKey){
      setTransactionPending(true)
      try {
        const [userPta] = findProgramAddressSync([utf8.encode('user'), publicKey.toBuffer()], program.programId)
        const [postPta] = findProgramAddressSync([utf8.encode('post'), publicKey.toBuffer(), Uint8Array.from([lastPostId])], program.programId)

        await program.methods
          .createPost(title, content)
          .accounts({
            postAccount: postPta,
            userAccount: userPta,
            authority: publicKey,
            SystemProgram: SystemProgram.programId
          }).rpc()

          setShowModel(false);

      } catch (error) {
          console.log(error)
      }finally{
        setTransactionPending(false)
      }
    } 
  }


  return (
    <BlogContext.Provider
      value={{
        user,
        initialized,
        nitUser,
        showModel,
        setShowModel,
        createPost,
        posts
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};
