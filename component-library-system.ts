// Component Library System

interface ComponentDefinition {
  id: string;
  name: string;
  category: ComponentCategory;
  type: ComponentType;
  icon: string;
  description: string;
  defaultProperties: ComponentProperties;
  terminals: TerminalDefinition[];
  gridWidth: number;
  gridHeight: number;
  simulationBehavior: SimulationBehavior;
}

interface TerminalDefinition {
  id: string;
  type: TerminalType;
  direction: 'input' | 'output' | 'bidirectional';
  position: { x: number; y: number };
  label?: string;
}

interface SimulationBehavior {
  logic: (state: SimulationState, inputs: Signal[], properties: ComponentProperties) => SimulationOutput;
  initialState: SimulationState;
  updateInterval?: number; // for timers, counters, etc.
}

type ComponentCategory = 
  | 'contacts'
  | 'coils'
  | 'timers'
  | 'counters'
  | 'protection'
  | 'pilot_devices'
  | 'power'
  | 'logic'
  | 'input'
  | 'output';

// Component Library Registry
class ComponentLibrary {
  private components: Map<string, ComponentDefinition>;
  private categories: Map<ComponentCategory, ComponentDefinition[]>;
  
  constructor() {
    this.components = new Map();
    this.categories = new Map();
    this.initializeBuiltinComponents();
  }
  
  getComponent(id: string): ComponentDefinition | undefined {
    return this.components.get(id);
  }
  
  getComponentsByCategory(category: ComponentCategory): ComponentDefinition[] {
    return this.categories.get(category) || [];
  }
  
  getAllCategories(): ComponentCategory[] {
    return Array.from(this.categories.keys());
  }
  
  private registerComponent(definition: ComponentDefinition): void {
    this.components.set(definition.id, definition);
    
    if (!this.categories.has(definition.category)) {
      this.categories.set(definition.category, []);
    }
    this.categories.get(definition.category)!.push(definition);
  }
  
  private initializeBuiltinComponents(): void {
    // Contacts
    this.registerComponent({
      id: 'contact_no',
      name: 'Normally Open Contact',
      category: 'contacts',
      type: 'contact_no',
      icon: 'contacts/no-contact.svg',
      description: 'Open contact that closes when coil is energized',
      defaultProperties: { label: '', address: '' },
      terminals: [
        { id: 'left', type: 'left', direction: 'input', position: { x: 0, y: 10 } },
        { id: 'right', type: 'right', direction: 'output', position: { x: 40, y: 10 } }
      ],
      gridWidth: 2,
      gridHeight: 1,
      simulationBehavior: {
        initialState: { energized: false },
        logic: (state, inputs, props) => ({
          energized: inputs[0]?.value || false,
          outputs: inputs[0]?.value || false ? [true] : [false]
        })
      }
    });
    
    this.registerComponent({
      id: 'contact_nc',
      name: 'Normally Closed Contact',
      category: 'contacts',
      type: 'contact_nc',
      icon: 'contacts/nc-contact.svg',
      description: 'Closed contact that opens when coil is energized',
      defaultProperties: { label: '', address: '' },
      terminals: [
        { id: 'left', type: 'left', direction: 'input', position: { x: 0, y: 10 } },
        { id: 'right', type: 'right', direction: 'output', position: { x: 40, y: 10 } }
      ],
      gridWidth: 2,
      gridHeight: 1,
      simulationBehavior: {
        initialState: { energized: true },
        logic: (state, inputs, props) => ({
          energized: !(inputs[0]?.value || false),
          outputs: !(inputs[0]?.value || false) ? [true] : [false]
        })
      }
    });
    
    // Coils
    this.registerComponent({
      id: 'coil',
      name: 'Relay Coil',
      category: 'coils',
      type: 'coil',
      icon: 'coils/relay-coil.svg',
      description: 'Electromagnetic coil that operates contacts',
      defaultProperties: { label: '', address: '' },
      terminals: [
        { id: 'left', type: 'left', direction: 'input', position: { x: 0, y: 10 } },
        { id: 'right', type: 'right', direction: 'output', position: { x: 40, y: 10 } }
      ],
      gridWidth: 2,
      gridHeight: 1,
      simulationBehavior: {
        initialState: { energized: false },
        logic: (state, inputs, props) => ({
          energized: inputs[0]?.value || false,
          outputs: [inputs[0]?.value || false]
        })
      }
    });
    
    // Timers
    this.registerComponent({
      id: 'timer_on',
      name: 'On-Delay Timer (TON)',
      category: 'timers',
      type: 'timer_on',
      icon: 'timers/timer-on.svg',
      description: 'Timer that starts timing when input goes on',
      defaultProperties: { 
        label: '', 
        address: '', 
        presetTime: 1000, 
        timeUnit: 'ms' 
      },
      terminals: [
        { id: 'enable', type: 'left', direction: 'input', position: { x: 0, y: 10 } },
        { id: 'output', type: 'right', direction: 'output', position: { x: 40, y: 10 } }
      ],
      gridWidth: 3,
      gridHeight: 1,
      simulationBehavior: {
        initialState: { energized: false, timerValue: 0 },
        updateInterval: 100,
        logic: (state, inputs, props) => {
          const enable = inputs[0]?.value || false;
          const presetTime = props.presetTime || 1000;
          
          if (enable && !state.energized) {
            // Start timing
            return {
              energized: false,
              timerValue: (state.timerValue || 0) + 100,
              outputs: [false]
            };
          } else if (enable && state.timerValue >= presetTime) {
            // Timer done
            return {
              energized: true,
              timerValue: presetTime,
              outputs: [true]
            };
          } else if (!enable) {
            // Reset
            return {
              energized: false,
              timerValue: 0,
              outputs: [false]
            };
          }
          
          return {
            energized: state.energized,
            timerValue: state.timerValue,
            outputs: [state.energized]
          };
        }
      }
    });
    
    this.registerComponent({
      id: 'timer_off',
      name: 'Off-Delay Timer (TOF)',
      category: 'timers',
      type: 'timer_off',
      icon: 'timers/timer-off.svg',
      description: 'Timer that starts timing when input goes off',
      defaultProperties: { 
        label: '', 
        address: '', 
        presetTime: 1000, 
        timeUnit: 'ms' 
      },
      terminals: [
        { id: 'enable', type: 'left', direction: 'input', position: { x: 0, y: 10 } },
        { id: 'output', type: 'right', direction: 'output', position: { x: 40, y: 10 } }
      ],
      gridWidth: 3,
      gridHeight: 1,
      simulationBehavior: {
        initialState: { energized: false, timerValue: 0 },
        updateInterval: 100,
        logic: (state, inputs, props) => {
          const enable = inputs[0]?.value || false;
          const presetTime = props.presetTime || 1000;
          
          if (enable) {
            // Input on, output on, reset timer
            return {
              energized: true,
              timerValue: 0,
              outputs: [true]
            };
          } else if (!enable && state.timerValue < presetTime) {
            // Input off, timing
            return {
              energized: true,
              timerValue: (state.timerValue || 0) + 100,
              outputs: [true]
            };
          } else if (!enable && state.timerValue >= presetTime) {
            // Timer done, output off
            return {
              energized: false,
              timerValue: presetTime,
              outputs: [false]
            };
          }
          
          return state;
        }
      }
    });
    
    // Protection Devices
    this.registerComponent({
      id: 'overload',
      name: 'Overload Relay',
      category: 'protection',
      type: 'overload',
      icon: 'protection/overload.svg',
      description: 'Thermal overload protection device',
      defaultProperties: { 
        label: '', 
        address: '', 
        tripCurrent: 10, 
        currentUnit: 'A' 
      },
      terminals: [
        { id: 'left', type: 'left', direction: 'input', position: { x: 0, y: 10 } },
        { id: 'right', type: 'right', direction: 'output', position: { x: 40, y: 10 } },
        { id: 'nc', type: 'bottom', direction: 'output', position: { x: 20, y: 20 } }
      ],
      gridWidth: 2,
      gridHeight: 2,
      simulationBehavior: {
        initialState: { energized: true, errorState: false },
        logic: (state, inputs, props) => {
          const input = inputs[0]?.value || false;
          const tripCurrent = props.tripCurrent || 10;
          // Simplified logic - would need current monitoring in real implementation
          return {
            energized: input && !state.errorState,
            errorState: state.errorState,
            outputs: [
              input && !state.errorState,  // Main output
              !state.errorState           // NC contact
            ]
          };
        }
      }
    });
    
    // Pilot Devices
    this.registerComponent({
      id: 'pilot_light',
      name: 'Indicator Light',
      category: 'pilot_devices',
      type: 'pilot_light',
      icon: 'pilot/light.svg',
      description: 'Visual indicator lamp',
      defaultProperties: { 
        label: '', 
        address: '', 
        color: 'red',
        voltage: '24VDC'
      },
      terminals: [
        { id: 'positive', type: 'left', direction: 'input', position: { x: 0, y: 10 } },
        { id: 'negative', type: 'right', direction: 'output', position: { x: 40, y: 10 } }
      ],
      gridWidth: 2,
      gridHeight: 1,
      simulationBehavior: {
        initialState: { energized: false },
        logic: (state, inputs, props) => ({
          energized: inputs[0]?.value || false,
          outputs: [inputs[0]?.value || false]
        })
      }
    });
    
    this.registerComponent({
      id: 'push_button',
      name: 'Push Button',
      category: 'input',
      type: 'push_button',
      icon: 'input/push-button.svg',
      description: 'Momentary push button switch',
      defaultProperties: { 
        label: '', 
        address: '', 
        buttonType: 'normally_open',
        momentary: true
      },
      terminals: [
        { id: 'left', type: 'left', direction: 'input', position: { x: 0, y: 10 } },
        { id: 'right', type: 'right', direction: 'output', position: { x: 40, y: 10 } }
      ],
      gridWidth: 2,
      gridHeight: 1,
      simulationBehavior: {
        initialState: { energized: false },
        logic: (state, inputs, props) => ({
          energized: false, // Would be controlled by user interaction
          outputs: [false]
        })
      }
    });
    
    // Power Components
    this.registerComponent({
      id: 'power_rail_l',
      name: 'Left Power Rail (L1)',
      category: 'power',
      type: 'power_rail',
      icon: 'power/rail-left.svg',
      description: 'Left power rail (hot)',
      defaultProperties: { voltage: '120VAC', phase: 'L1' },
      terminals: [
        { id: 'output1', type: 'right', direction: 'output', position: { x: 20, y: 10 } },
        { id: 'output2', type: 'right', direction: 'output', position: { x: 20, y: 50 } },
        { id: 'output3', type: 'right', direction: 'output', position: { x: 20, y: 90 } }
      ],
      gridWidth: 1,
      gridHeight: 5,
      simulationBehavior: {
        initialState: { energized: true },
        logic: (state, inputs, props) => ({
          energized: true,
          outputs: [true, true, true]
        })
      }
    });
    
    this.registerComponent({
      id: 'power_rail_n',
      name: 'Right Power Rail (N)',
      category: 'power',
      type: 'power_rail',
      icon: 'power/rail-right.svg',
      description: 'Right power rail (neutral)',
      defaultProperties: { voltage: '0V', phase: 'N' },
      terminals: [
        { id: 'input1', type: 'left', direction: 'input', position: { x: 0, y: 10 } },
        { id: 'input2', type: 'left', direction: 'input', position: { x: 0, y: 50 } },
        { id: 'input3', type: 'left', direction: 'input', position: { x: 0, y: 90 } }
      ],
      gridWidth: 1,
      gridHeight: 5,
      simulationBehavior: {
        initialState: { energized: false },
        logic: (state, inputs, props) => ({
          energized: false,
          outputs: [false, false, false]
        })
      }
    });
  }
}

// Component Library UI Component
export const ComponentLibraryPanel: React.FC<{
  onComponentSelect: (component: ComponentDefinition) => void;
}> = ({ onComponentSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>('contacts');
  const library = useMemo(() => new ComponentLibrary(), []);
  
  const categories = library.getAllCategories();
  const components = library.getComponentsByCategory(selectedCategory);
  
  return (
    <div className="component-library">
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`tab ${selectedCategory === category ? 'active' : ''}`}
          >
            {category.replace('_', ' ')}
          </button>
        ))}
      </div>
      
      <div className="component-grid">
        {components.map(component => (
          <div
            key={component.id}
            className="component-item"
            onClick={() => onComponentSelect(component)}
          >
            <img src={component.icon} alt={component.name} />
            <span>{component.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};