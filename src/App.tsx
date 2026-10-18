import React from 'react'
import { useAgroStore } from './store/useAgroStore'
import { Header } from './components/common/Header'
import { Toast } from './components/common/Toast'
import { ModuleHub } from './components/hub/ModuleHub'
import { OperationalLayout } from './components/layout/OperationalLayout'
import { View1Recepcion } from './components/views/View1Recepcion'
import { View2Gastos } from './components/views/View2Gastos'
import { View3Calibracion } from './components/views/View3Calibracion'
import { View4Resumen } from './components/views/View4Resumen'

export const App: React.FC = () => {
  const { activeModule, activeBodegaView } = useAgroStore()

  const renderActiveView = () => {
    switch (activeBodegaView) {
      case 'ingreso':
        return <View1Recepcion />
      case 'gastos':
        return <View2Gastos />
      case 'calibracion':
        return <View3Calibracion />
      case 'resumen':
        return <View4Resumen />
      default:
        return <View1Recepcion />
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      {activeModule === 'hub' ? (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
          <Header showModuleBreadcrumb={false} />
          <ModuleHub />
        </div>
      ) : (
        <OperationalLayout>{renderActiveView()}</OperationalLayout>
      )}
      <Toast />
    </div>
  )
}

export default App
