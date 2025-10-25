import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import ThreadDetail from "./pages/ThreadDetail";
import ThreadsPage from "./pages/ThreadsPage";
import About from "./pages/About";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import DirectAdmin from "./pages/DirectAdmin";
import Unsubscribe from "./pages/Unsubscribe";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import PostsList from "./pages/admin/PostsList";
import NewPost from "./pages/admin/NewPost";
import EditPost from "./pages/admin/EditPost";
import ThreadsList from "./pages/admin/ThreadsList";
import NewThread from "./pages/admin/NewThread";
import EditThread from "./pages/admin/EditThread";
import ThreadPosts from "./pages/admin/ThreadPosts";
import NewThreadPost from "./pages/admin/NewThreadPost";
import Transactions from "./pages/admin/Transactions";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/post/:slug" element={<PublicLayout><PostDetail /></PublicLayout>} />
              <Route path="/threads" element={<PublicLayout><ThreadsPage /></PublicLayout>} />
              <Route path="/thread/:slug" element={<PublicLayout><ThreadDetail /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/categories" element={<PublicLayout><Categories /></PublicLayout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-access" element={<DirectAdmin />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="posts" element={<PostsList />} />
                <Route path="posts/new" element={<NewPost />} />
                <Route path="posts/:id/edit" element={<EditPost />} />
                <Route path="threads" element={<ThreadsList />} />
                <Route path="threads/new" element={<NewThread />} />
                <Route path="threads/:id/edit" element={<EditThread />} />
                <Route path="threads/:id/posts" element={<ThreadPosts />} />
                <Route path="threads/:id/posts/new" element={<NewThreadPost />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
