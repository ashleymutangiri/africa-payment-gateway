export function CountryFlag({ country }: { country: string }) {
  switch (country) {
    case "Zimbabwe":
      return (
        <span className="mr-2 text-lg" role="img" aria-label="Zimbabwe flag">
          🇿🇼
        </span>
      )
    case "Zambia":
      return (
        <span className="mr-2 text-lg" role="img" aria-label="Zambia flag">
          🇿🇲
        </span>
      )
    case "South Africa":
      return (
        <span className="mr-2 text-lg" role="img" aria-label="South Africa flag">
          🇿🇦
        </span>
      )
    case "United Kingdom":
      return (
        <span className="mr-2 text-lg" role="img" aria-label="United Kingdom flag">
          🇬🇧
        </span>
      )
    case "United States":
      return (
        <span className="mr-2 text-lg" role="img" aria-label="United States flag">
          🇺🇸
        </span>
      )
    default:
      return null
  }
}
