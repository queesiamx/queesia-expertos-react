import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function ExpertModal({
  isOpen,
  onClose,
  availableDates,
  fechaSeleccionada,
  setFechaSeleccionada,
  onConfirm,
  isBuying
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                Selecciona una fecha disponible
              </Dialog.Title>
              <div className="mt-2">
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-2"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                >
                  <option value="">-- Selecciona una fecha --</option>
                  {availableDates?.map((f, idx) => (
                    <option key={idx} value={f}>
                      {new Date(f).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={onConfirm}
                  disabled={!fechaSeleccionada}
                >
                  {isBuying ? "Proceder al pago" : "Confirmar registro"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
