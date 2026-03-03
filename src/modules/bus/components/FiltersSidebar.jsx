import { useState } from "react";
import {
  Search,
  Sun,
  Moon,
  CloudSun,
  Sunset,
  Snowflake,
  Star,
  BedDouble,
  Armchair,
} from "lucide-react";
import { Checkbox } from "../components/ui/Checkbox";

const popularOptions = [
  { label: "AC", icon: <Snowflake className="h-4 w-4" /> },
  { label: "Primo", icon: <Star className="h-4 w-4" /> },
  { label: "6PM-12AM", icon: <Sunset className="h-4 w-4" /> },
  { label: "Sleeper", icon: <BedDouble className="h-4 w-4" /> },
];

const busTypeOptions = [
  { label: "AC", icon: <Snowflake className="h-4 w-4" /> },
  { label: "Non-AC", icon: <Snowflake className="h-4 w-4 opacity-40" /> },
  { label: "Seater", icon: <Armchair className="h-4 w-4" /> },
  { label: "Sleeper", icon: <BedDouble className="h-4 w-4" /> },
];

const singleOptions = [
  { label: "Single Seater", icon: <Armchair className="h-4 w-4" /> },
  { label: "Single Sleeper", icon: <BedDouble className="h-4 w-4" /> },
];

const timeSlots = [
  { label: "12 midnight - 6 AM", icon: <Moon className="h-4 w-4" /> },
  { label: "6 AM - 12 noon", icon: <Sun className="h-4 w-4" /> },
  { label: "12 noon - 6 PM", icon: <CloudSun className="h-4 w-4" /> },
  { label: "6 PM - 12 midnight", icon: <Sunset className="h-4 w-4" /> },
];

const boardingPoints = [
  "Abids",
  "Abids Pickup VanBus",
  "Afzalgunj Pickup VanBus",
];
const droppingPoints = ["Vemulawada", "VEMULAWADA BS"];
const operators = ["BSR Tours And Travels", "Sai Sri Krishna Travels"];
const amenities = ["Blankets", "Charging Point", "Reading Light"];

const CheckboxSection = ({
  title,
  items,
  searchPlaceholder,
  selected,
  onToggle,
  onClear,
  showSearch = true,
  showMore = false,
}) => {
  const [search, setSearch] = useState("");

  const filtered = items.filter((i) =>
    i.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
          {title}
        </h3>
        <button
          onClick={onClear}
          disabled={selected.size === 0}
          className={`text-xs font-bold ${
            selected.size === 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#FD561E] cursor-pointer"
          }`}
        >
          Clear All
        </button>
      </div>

      {showSearch && (
        <div className="relative mb-3">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground pr-9"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="space-y-2.5">
        {filtered.map((item) => (
          <label
            key={item}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <Checkbox
              checked={selected.has(item)}
              onChange={() => onToggle(item)}
            />
            <span className="text-sm text-foreground">{item}</span>
          </label>
        ))}
      </div>

      {showMore && (
        <button className="text-xs font-medium text-[#FD561E] mt-2 hover:underline">
          + Show all {title.toLowerCase()}
        </button>
      )}
    </div>
  );
};

const FiltersSidebar = () => {
  const [chipSelected, setChipSelected] = useState(new Set());
  const [depTime, setDepTime] = useState(new Set());
  const [arrTime, setArrTime] = useState(new Set());
  const [boarding, setBoarding] = useState(new Set());
  const [dropping, setDropping] = useState(new Set());
  const [ops, setOps] = useState(new Set());
  const [amens, setAmens] = useState(new Set());

  const toggleChip = (key) => {
    setChipSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleSet = (setter, key) => {
    setter((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const clearSet = (setter) => setter(new Set());

  const clearAll = () => {
    setChipSelected(new Set());
    setDepTime(new Set());
    setArrTime(new Set());
    setBoarding(new Set());
    setDropping(new Set());
    setOps(new Set());
    setAmens(new Set());
  };

  const TimeGrid = ({ title, selected, setSelected }) => (
    <div>
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">
        {title}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map((slot) => {
          const isActive = selected.has(slot.label);
          return (
            <button
              key={slot.label}
              onClick={() => toggleSet(setSelected, slot.label)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs  transition-all ${
                isActive
                  ? "border-[#FD561E] bg-[#FD561E]/10 text-[#FD561E]"
                  : "border-gray-300 bg-gray-50 text-muted-foreground hover:border-[#FD561E]"
              }`}
            >
              {slot.icon}
              <span className="text-center leading-tight">{slot.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-full bg-white rounded-xl shadow-sm  p-5  top-24">
      <div className="flex items-center justify-between mb-5 pb-3  border-b border-gray-300 -mx-5 px-5">
        <h2 className="text-base font-bold text-foreground">Filters</h2>
        <button
          onClick={clearAll}
          disabled={
            chipSelected.size === 0 &&
            depTime.size === 0 &&
            arrTime.size === 0 &&
            boarding.size === 0 &&
            dropping.size === 0 &&
            ops.size === 0 &&
            amens.size === 0
          }
          className={`text-xs font-bold transition-colors duration-200 ${
            chipSelected.size === 0 &&
            depTime.size === 0 &&
            arrTime.size === 0 &&
            boarding.size === 0 &&
            dropping.size === 0 &&
            ops.size === 0 &&
            amens.size === 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#FD561E] cursor-pointer"
          }`}
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {[
          { title: "Popular", options: popularOptions },
          { title: "Bus Type", options: busTypeOptions },
          { title: "Single Seater / Sleeper", options: singleOptions },
        ].map(({ title, options }) => (
          <div
            key={title}
            className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5"
          >
            <h3 className="text-sm font-bold  text-foreground uppercase tracking-wide mb-3">
              {title}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {options.map((opt) => {
                const key = `${title}__${opt.label}`;
                const isActive = chipSelected.has(key);

                return (
                  <button
                    key={key}
                    onClick={() => toggleChip(key)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border bg-gray-50  text-xs  transition-all ${
                      isActive
                        ? "border-[#FD561E] bg-[#FD561E]/10 text-[#FD561E]"
                        : "border border-gray-300 bg-background text-muted-foreground hover:border-[#fd561e]"
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <TimeGrid
            title="Departure Time"
            selected={depTime}
            setSelected={setDepTime}
          />
        </div>
        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <TimeGrid
            title="Arrival Time"
            selected={arrTime}
            setSelected={setArrTime}
          />
        </div>
        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <CheckboxSection
            title="Boarding Point"
            items={boardingPoints}
            searchPlaceholder="Enter/Search boarding point"
            selected={boarding}
            onToggle={(i) => toggleSet(setBoarding, i)}
            onClear={() => clearSet(setBoarding)}
            showMore
          />
        </div>
        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <CheckboxSection
            checkboxClass="border-gray-200"
            title="Dropping Point"
            items={droppingPoints}
            searchPlaceholder="Enter/Search dropping point"
            selected={dropping}
            onToggle={(i) => toggleSet(setDropping, i)}
            onClear={() => clearSet(setDropping)}
          />
        </div>
        <div className="pb-4 mb-4 border-b border-gray-200 -mx-5 px-5">
          <CheckboxSection
            title="Operator"
            items={operators}
            searchPlaceholder="Enter/Search operator"
            selected={ops}
            onToggle={(i) => toggleSet(setOps, i)}
            onClear={() => clearSet(setOps)}
            showMore
          />
        </div>

        <CheckboxSection
          title="Amenities"
          items={amenities}
          searchPlaceholder=""
          selected={amens}
          onToggle={(i) => toggleSet(setAmens, i)}
          onClear={() => clearSet(setAmens)}
          showSearch={false}
        />
      </div>
    </aside>
  );
};

export default FiltersSidebar;
