export default function Details({ listing }) {
    console.log(listing)
  
    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          {(Object.entries(listing?.details || {})).map(([key, value], index) => (
            <div
              key={index}
              className="flex flex-col p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white"
            >
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {key}
              </span>
              <span className="text-base font-medium text-gray-900 mt-1">
                {value}
              </span>
            </div>
          ))}
        </div>
      </>
    )
  }
  