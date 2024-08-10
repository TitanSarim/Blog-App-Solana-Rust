import { useMemo } from "react"
import { BlogProvider } from "src/context/Blog"
import { Router } from "src/router"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"
import "./App.css"


export const App = () => {

  const endPoint = "https://cosmological-thrumming-sponge.solana-devnet.quiknode.pro/b36f12a18c8b64b081fba6fc2f8b7c7d92ea8eec"
  
  const wallets = useMemo( () => [
    new PhantomWalletAdapter(),
  ],[])

  return (

    <ConnectionProvider endpoint={endPoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <BlogProvider>
          <Router />
        </BlogProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
