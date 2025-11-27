import './styles/globals.css'
import AppRouter from "@/router/AppRouter";
import {Toaster} from "@/components/ui/toaster";
import {GlobalLoading} from "@/components/ui/global-loading";

function App() {
    return (
        <>
                <GlobalLoading />
                <AppRouter/>
                <Toaster/>

        </>
    )
}

export default App
