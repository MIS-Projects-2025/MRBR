import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Bar } from "react-chartjs-2";
import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function EADashboard({
  eaTrendPerWw,
  eaTrendPerDate,
  eaTrendPerFactory,
  eaTrendPerPackage,
  eaTrendPerMachine,
  filters,
  query
}) {

// Single color
const singleColor = "hsl(140, 45%, 55%)"; // palitan ang 200 sa gusto mong hue

const getColor = () => singleColor;

  // BAR + TARGET LINE BUILDER
  const buildBarData = (data, labelKey, valueKey) => ({

    labels: data.map(d => d[labelKey]),

    datasets: [

      {
        type: "bar",
        label: "Average EA",
        data: data.map(d => d[valueKey]),
        backgroundColor: data.map((_, i) => getColor(i))
      },

      {
        type: "line",
        label: "Target 90%",
        data: data.map(() => 90),
        borderColor: "blue",
        borderWidth: 2,
        borderDash: [1,1],
        pointRadius: 0
      }

    ]
  });

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Equipment Efficiency (%)"
        }
      }
    }
  };

  // FILTER STATE
  const [selectedFilters, setSelectedFilters] = React.useState({
    ww: [],
    date: [],
    factory: [],
    productline: [],
    package: [],
    machine: []
  });

  const handleSelectChange = (name, e) => {

    const values = [...e.target.selectedOptions].map(o => o.value);

    const updated = {
      ...selectedFilters,
      [name]: values
    };

    setSelectedFilters(updated);

    router.get(route("ea.graph.index"), updated, {
      preserveState: true,
      replace: true
    });
  };

  const FilterSelect = ({ label, data, name }) => (
    <div>
      <label className="text-sm font-semibold">{label}</label>

      <select
        multiple
        className="border rounded w-full p-2 h-32"
        value={selectedFilters[name]}
        onChange={(e) => handleSelectChange(name, e)}
      >
        {data.map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    </div>
  );

  return (
    <AuthenticatedLayout>

      <Head title="EA Dashboard" />

      <div className="p-6">

        {/* FILTER PANEL */}
        <div className="sticky top-0 bg-white z-10 p-4 shadow mb-6">

          <h1 className="text-2xl font-bold mb-4">
            📊 Equipment Efficiency Dashboard
          </h1>

          <div className="grid grid-cols-6 gap-4">

            <FilterSelect label="WW" data={filters.ww} name="ww" />
            <FilterSelect label="Date" data={filters.date} name="date" />
            <FilterSelect label="Factory" data={filters.factory} name="factory" />
            <FilterSelect label="Product Line" data={filters.productline} name="productline" />
            <FilterSelect label="Package" data={filters.package} name="package" />
            <FilterSelect label="Machine" data={filters.machine} name="machine" />

          </div>

        </div>

        {/* CHART AREA */}
        <div className="grid grid-cols-2 gap-6">

          {/* WEEKLY */}
          <div className="bg-white p-4 rounded shadow">

            <h2 className="font-bold mb-3">
              EA Trend per Week
            </h2>

            <Bar
              options={barOptions}
              data={buildBarData(eaTrendPerWw, "ww", "avg")}
              
            />

          </div>

          {/* DAILY */}
          <div className="bg-white p-4 rounded shadow">

            <h2 className="font-bold mb-3">
              EA Trend per Date
            </h2>

            <Bar
              options={barOptions}
              data={buildBarData(eaTrendPerDate, "date", "avg")}
            />

          </div>

          {/* FACTORY */}
          <div className="bg-white p-4 rounded shadow">

            <h2 className="font-bold mb-3">
              Factory Performance
            </h2>

            <Bar
              options={barOptions}
              data={buildBarData(eaTrendPerFactory, "factory", "avg")}
            />

          </div>

          {/* PACKAGE */}
          <div className="bg-white p-4 rounded shadow">

            <h2 className="font-bold mb-3">
              Package Performance
            </h2>

            <Bar
              options={barOptions}
              data={buildBarData(eaTrendPerPackage, "package", "avg")}
            />

          </div>

          {/* MACHINE */}
          <div className="bg-white p-4 rounded shadow col-span-2">

            <h2 className="font-bold mb-3">
              Machine Performance
            </h2>

            <Bar
              options={barOptions}
              data={buildBarData(eaTrendPerMachine, "machine", "avg")}
            />

          </div>

        </div>

      </div>

    </AuthenticatedLayout>
  );
}