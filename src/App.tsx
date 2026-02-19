import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@components/Layout'
import { LadderEditor } from '@components/LadderEditor'
import { ComponentLibraryPanel } from '@components/ComponentLibraryPanel'
import { SimulationControls } from '@components/SimulationControls'
import { PropertiesPanel } from '@components/PropertiesPanel'
import { ProjectExplorer } from '@components/ProjectExplorer'
import { MenuBar } from '@components/MenuBar'
import { ToolBar } from '@components/ToolBar'
import { StatusBar } from '@components/StatusBar'
import { useAppSelector } from '@services/store/hooks'

function App() {
  const currentProject = useAppSelector(state => state.project.current)
  const simulationMode = useAppSelector(state => state.simulation.isRunning)
  
  return (
    <div className="h-screen flex flex-col bg-industrial-light">
      <MenuBar />
      <ToolBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-industrial-gray bg-white flex flex-col">
          <ProjectExplorer />
          <ComponentLibraryPanel 
            onComponentSelect={(component) => {
              // Handle component selection
              console.log('Selected component:', component)
            }} 
          />
        </div>
        
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <Layout>
            <div className={`flex-1 ${simulationMode ? 'simulation-running' : 'simulation-stopped'}`}>
              <LadderEditor
                diagram={currentProject?.activeDiagram}
                onDiagramChange={(diagram) => {
                  // Handle diagram changes
                  console.log('Diagram changed:', diagram)
                }}
                simulationMode={simulationMode}
                selectedTool="select"
              />
            </div>
            
            <div className="h-32 border-t border-industrial-gray bg-white">
              <SimulationControls
                engine={null} // Will be initialized with simulation engine
                isRunning={simulationMode}
                onToggleRun={() => console.log('Toggle simulation')}
                onStep={() => console.log('Step simulation')}
                onReset={() => console.log('Reset simulation')}
              />
            </div>
          </Layout>
        </div>
        
        {/* Right Sidebar */}
        <div className="w-80 border-l border-industrial-gray bg-white">
          <PropertiesPanel />
        </div>
      </div>
      
      <StatusBar />
    </div>
  )
}

export default App