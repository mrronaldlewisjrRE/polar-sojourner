import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const CDH_SIGNATURE = `

--
CDH Associates
8816 College Grove, TN 37046
O: +1(423) 894-9417 | F: (615) 368-3381
csr@CDHAssociates.com
Internal Ops Portal v5A
`;

export function generateEmailTemplate(type, data) {
    if (type === 'new_order') {
        const { poNumber, retailerName } = data;
        return {
            subject: `NB ORDER: ${retailerName} (PO# ${poNumber})`,
            body: `Attn: Order Entry,

Please process the attached order for ${retailerName}.

PO Number: ${poNumber}
Submission Time: ${new Date().toLocaleString()}

Please confirm receipt and estimated ship date.

Thank you,${CDH_SIGNATURE}`
        };
    }
    return { subject: '', body: '' };
}
