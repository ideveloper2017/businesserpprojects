import './styles/globals.css'
import AppRouter from "@/router/AppRouter.tsx";
import {Toaster} from "@/components/ui/toaster";

function App() {
    return (
        <>
                <AppRouter/>
                <Toaster/>

        </>
    )
}

export default App
