type JsonLdValue=string|number|boolean|null|JsonLdValue[]|{[key:string]:JsonLdValue};
export function JsonLd({data}:{data:{[key:string]:JsonLdValue}}){const json=JSON.stringify(data).replace(/</g,"\\u003c");return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:json}}/>}
