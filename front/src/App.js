import React from 'react'
import Login from './pages/login'
import Index from './pages'
import Etudiant from './pages/etudiant'
import Projet from './pages/projet'
import Calendrier from './pages/calendrier'
import CalendrierEtudiant from './pages/calendrierEtudiant'
import Dashboard from './pages/dashboard'
import Livrable from './pages/livrable'
import MesLivrable from './pages/mesLivrable'
import MesProjet from './pages/mesProjet'
import Parametre from './pages/parametre'
import ParametreEtudiant from './pages/parametreEtudiant'
import ProjetDetail from './pages/projetDetail'
import Statistique from './pages/statistique'
import StatistiqueEtudiant from './pages/statistiqueEtudiant'
import EtudiantDetail from './pages/etudiantDetail'
import Creation from './pages/creation'
import Admin from './pages/admin'
import ParametreAdmin from'./pages/parametreAdmin'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route path='/index' element={<Index />} />
        <Route path='/etudiant' element={<Etudiant />} />
        <Route path='/projet' element={<Projet />} />
        <Route path='/calendrier' element={<Calendrier/>} />
        <Route path='/calendrierEtudiant' element={<CalendrierEtudiant/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/livrable' element={<Livrable/>} />
        <Route path='/mes_livrables' element={<MesLivrable/>} />
        <Route path='/mes_projet' element={<MesProjet/>} />
        <Route path='/parametre' element={<Parametre/>} />
        <Route path='/parametre_etudiant' element={<ParametreEtudiant/>} />
        <Route path='/projet_detail/:id' element={<ProjetDetail/>} />
        <Route path='/statistique' element={<Statistique/>} />
        <Route path='/statistique_etudiant' element={<StatistiqueEtudiant/>} />
        <Route path='/etudiant/:immatricule' element={<EtudiantDetail />} />
        <Route path='/creation' element={<Creation/>} />
        <Route path='/admin/users' element={<Admin/>} />
        <Route path='/admin/setting' element={<ParametreAdmin/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
