import React, { useState } from 'react'
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

export default function Calendar(props: any) {
    const [value, setValue] = React.useState<Dayjs | null>(dayjs());
    const [showCalendar, setShowCalendar] = useState(false);
    const [active, setActive] = useState(false);

    return (
        <div className="flex flex-col">
            <button onClick={() => setShowCalendar(!showCalendar)} style={{
                border: 0,
                background: 0
            }}>
                <input
                    type="text"
                    placeholder={props.placeholder}
                    className={props.className}
                    style={{ outline: "none" }}
                    value={active ? value ? value.format('YYYY-MM-DD') : props.placeholder : props.placeholder}
                />
            </button>
            {showCalendar ? <div style={{
                position: "absolute",
                zIndex: 1000,
                backgroundColor: "white",
                borderRadius: "20px"
            }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar value={value} onChange={(newValue) => {
                        setValue(newValue)
                        setActive(true)
                        setShowCalendar(false)
                    }} />
                </LocalizationProvider>
            </div> : undefined}
        </div>
    )
}
