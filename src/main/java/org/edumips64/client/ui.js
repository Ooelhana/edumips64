'use strict';

const Registers = (props) => {
    return (
        <div className="pure-u-1 pure-u-lg-1-4">
            <table>
                {props.registers.map(register => (
                    <tr key={register.name}>
                        <td className="registerName">{register.name}</td>
                        <td className="registerValue">{register.value}</td>
                    </tr>
                ))
                }

            </table>
        </div>
    ); 
}

// A toy component that appends a final "s" to the label if
// the given value is != 1. Of course this is not proper
// pluralization, just me playing around with React.
const PluralLabel = ({label, value}) => {
    const pluralize = value => value != 1 ? "s" : "";
    return <p>{value} {label}{pluralize(value)}</p>
}

const Statistics = ({cycles, instructions, rawStalls, wawStalls, memoryStalls, codeSizeBytes, fcsr}) => {
    // TODO: FCSR.
    return (
        <div className="pure-u-1 pure-u-lg-1-4">
            <div className="widget">
                <p>
                <b>Execution</b>
                <PluralLabel value={cycles} label="Cycle" />
                <PluralLabel value={instructions} label="Instruction" />
                <p>{instructions == 0 ? 0 : (cycles / instructions).toFixed(2)} Cycles per Instructions (CPI)</p>
                </p>
                <p>
                <b>Stalls</b>
                <PluralLabel value={rawStalls} label="RAW Stall" />
                <PluralLabel value={wawStalls} label="WAW Stall" />
                <PluralLabel value={memoryStalls} label="Memory Stall" />
                <b>Code size</b>
                <p>{codeSizeBytes} Bytes</p>
                </p>
            </div>
        </div>
    );
}
const Memory = (props) => {
    return (
        <div className="pure-u-1 pure-u-lg-1-4">
            <textarea readOnly value={props.memory} />
        </div>
    );
}

const Code = (props) => {
    return (
        <div className="pure-u-1 pure-u-lg-1-4">
            <textarea 
                value={props.code}
                onChange={(event) => {props.onChangeValue(event.target.value);}}
                />
            <br />
            <input id="run-button" type="button" value="Run" onClick={() => {props.onClick()}} />
        </div>
    );
}

const Simulator = (props) => {
    const emptyReg = "0000000000000000";
    const regs = [...Array(32).keys()];
    const defaultRegisters = regs.map(r => {
        return {name: `R${r}`, value: emptyReg};
    })

    const defaultStats = {
        "cycles": 0,
        "instructions": 0,
        "rawStalls": 0,
        "wawStalls": 0,
        "dividerStalls": 0,
        "memoryStalls": 0,
        "codeSizeBytes": 0,
        "fcsr": emptyReg
    }

    const [registers, setRegisters] = React.useState(defaultRegisters);
    const [memory, setMemory] = React.useState("Memory will appear here.");
    const [stats, setStats] = React.useState(defaultStats);
    const [code, setCode] = React.useState(`; Example program. Loads the value 10 (A) into R1.
.data
    .word64 10

.code
    lw r1, 0(r0)
    SYSCALL 0
`);

    const runCode = () => {
        console.log("Executing runCode");
        const simulator = new jsedumips64.WebUi();
        simulator.init();
        const result = simulator.runProgram(code);
        if (result.length != 0) {
            alert(result);
        } else {
            setRegisters(JSON.parse(simulator.getRegisters()));
            setMemory(simulator.getMemory());
            setStats(JSON.parse(simulator.getStatistics()));
        }
    }

    return (
        <React.Fragment>
            <Code onClick={runCode} onChangeValue ={(text) => setCode(text)} code={code}/>
            <Registers registers={registers}/>
            <Memory memory={memory}/>
            <Statistics {...stats}/>
        </React.Fragment>
    );
}

ReactDOM.render(
    <Simulator />,
    document.getElementById('simulator')
);