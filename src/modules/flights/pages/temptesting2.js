{
    "success": true,
    "traceId": "BOBROS-1780489157753",
    "message": "Flight priced successfully.",
    "attempt": 1,
    "data": {
        "SOAP:Envelope": {
            "$": {
                "xmlns:SOAP": "http://schemas.xmlsoap.org/soap/envelope/"
            },
            "SOAP:Body": {
                "air:AirPriceRsp": {
                    "$": {
                        "xmlns:air": "http://www.travelport.com/schema/air_v54_0",
                        "xmlns:common_v54_0": "http://www.travelport.com/schema/common_v54_0",
                        "TraceId": "BOBROS-1780489157753",
                        "TransactionId": "8D7274550A0D6A92716C1864B9CB10A6",
                        "ResponseTime": "5137"
                    },
                    "common_v54_0:ResponseMessage": {
                        "_": "Miscellaneous alert returned from vendor Please remember to select the complimentary seat and meal included in the fare",
                        "$": {
                            "Code": "15094",
                            "Type": "Warning",
                            "ProviderCode": "ACH",
                            "SupplierCode": "6E"
                        }
                    },
                    "air:AirItinerary": {
                        "air:AirSegment": {
                            "$": {
                                "Key": "7RlXH6SqWDKAzkQADAAAAA==",
                                "Group": "0",
                                "Carrier": "6E",
                                "FlightNumber": "5174",
                                "ProviderCode": "ACH",
                                "Origin": "HYD",
                                "Destination": "BOM",
                                "DepartureTime": "2026-10-12T09:30:00.000+05:30",
                                "ArrivalTime": "2026-10-12T10:55:00.000+05:30",
                                "FlightTime": "85",
                                "TravelTime": "85",
                                "ClassOfService": "Y",
                                "Equipment": "321",
                                "Status": "KK",
                                "ChangeOfPlane": "false",
                                "HostTokenRef": "7RlXH6SqWDKA0kQADAAAAA==",
                                "SupplierCode": "6E",
                                "OptionalServicesIndicator": "true",
                                "APISRequirementsRef": "7RlXH6SqWDKA1kQADAAAAA=="
                            },
                            "air:CodeshareInfo": {
                                "$": {
                                    "OperatingCarrier": "6E",
                                    "OperatingFlightNumber": "5174"
                                }
                            }
                        },
                        "common_v54_0:HostToken": {
                            "_": "NNS6E{IS###}INR{CC###ET}ACHSDv01LPD1:bd356f8d-31b7-40dc-a0aa-0ef401c55523",
                            "$": {
                                "Key": "7RlXH6SqWDKA0kQADAAAAA=="
                            }
                        },
                        "air:APISRequirements": {
                            "$": {
                                "Key": "7RlXH6SqWDKA1kQADAAAAA==",
                                "Level": "Supported"
                            },
                            "air:Document": {
                                "$": {
                                    "Sequence": "1",
                                    "Type": "Passport",
                                    "Level": "Supported"
                                }
                            }
                        }
                    },
                    "air:AirPriceResult": {
                        "air:AirPricingSolution": {
                            "$": {
                                "Key": "7RlXH6SqWDKA2kQADAAAAA==",
                                "TotalPrice": "INR4358.00",
                                "BasePrice": "INR2400.00",
                                "ApproximateTotalPrice": "INR4358.00",
                                "ApproximateBasePrice": "INR2400.00",
                                "Taxes": "INR1958.00",
                                "ApproximateTaxes": "INR1958.00"
                            },
                            "air:AirSegmentRef": {
                                "$": {
                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                }
                            },
                            "air:AirPricingInfo": {
                                "$": {
                                    "Key": "7RlXH6SqWDKA3kQADAAAAA==",
                                    "TotalPrice": "INR4358.00",
                                    "BasePrice": "INR2400.00",
                                    "ApproximateTotalPrice": "INR4358.00",
                                    "ApproximateBasePrice": "INR2400.00",
                                    "ApproximateTaxes": "INR1958.00",
                                    "Taxes": "INR1958.00",
                                    "PricingMethod": "Auto",
                                    "ProviderCode": "ACH"
                                },
                                "air:FareInfo": {
                                    "$": {
                                        "Key": "7RlXH6SqWDKAAlQADAAAAA==",
                                        "FareBasis": "RUIP",
                                        "PassengerTypeCode": "ADT",
                                        "Origin": "HYD",
                                        "Destination": "BOM",
                                        "EffectiveDate": "2026-06-03T17:55:53.321+05:30",
                                        "DepartureDate": "2026-10-12",
                                        "Amount": "INR2400.00",
                                        "PromotionalFare": "false",
                                        "FareFamily": "Flexible Plus Fare",
                                        "SupplierCode": "6E"
                                    },
                                    "air:FareRuleKey": {
                                        "_": "H4sIAAAAAAAA/+1bzY8cRxVvfwTb48R2YkcIpKCSokR2Mh+28Rdr5WM/7Yk39mp3TZRcoprumunydnd1qqp3ZnKIhJC4RAIk4MCBIydygX8CIcGFEyfgwAUJ/gBuvFdV/TGzs8a92iA7GR9sT3XVe6/ee/V7v6qu/uLf3nNKequ+iNta0l0WpULqthK0PQhUm3IZ8YS1Q6F0OxYBi9rUD9uLXHY1tEsqxxuS+zwZdJO+8OyfI0e9k+ve830qGbauc6W19/L6I7pLO5nmUWdRSjrG5tvr3gscBG0LTaM16K+9t9bBlE5pSgdM6YApHWdKB03pGFM6YEqnWx0O8s6LVHOR0GiLyV3uM6v9XEW7U/ytqY6qYkS3phEP9hMFel5Mt5fxv0uS0Z1ADBP1ifeZdwQclILn2Cb7BJ2kvTs1dW640RlTGiXImKIR6NLUhmRLZNKH2bxkJx/RZNDZ0hKeQKezkuX6My5ZgEZ9Y5RCLpzH3m10VbsI1OgHf37ll7+nvzrmHel6xxX/lI1SjPTwOP4Ng27US6A1lxtlxpxe985QKfkujSC7UIb2btV0ybrwcx+cC1hKpc4kc9JwfqDjhaJ9hWpmJg2+CLjyRZZol8vae6em5pVJARgETP9N1meSJf4B8nqtOtzI49BtsGh7a+9mTXluILompnKH6aqwd2sKe39KAkg9k7CB0BycGqDpzrMvTbYugwT35KTMImYzv26YN91I9IpO6epIs0RB2FV9L29vLJbDb5v0r5nJec6VmXx03Tvtw/NlkWg20m6+z0euY+GDUaq9493F7UXtHVt68L6BhfNl090PV1K053b9lVXkTWkUWHCa+iZHK0F4cSJJt0trz0mmloTYWWGKDyoDLmjuQ+RNc0K1kJVnZ7J0IGnAFqNIDB2grHvfdK2bswSOUvDBS2sRG/FexMhGlCliEfjIh+CJzYfdDeOD67XLEzZPhOS4X1q6JzwYiqM3Vp3zQeHb9RROr4dS83P/QzO4GlSlNBlvhaDoPo0LUFIgL2LfZ0kgZDfJ/fm8tWqL+eD9Gcan5k/9vJlYCaX958AQlzcPFcOVp+qj4+KkAEQLGgTc1sw1hiLfrityYjwiAcW0o5DGFlTuHgBvl+hgQAc2gXNJIPplGqP5qpv4URawoJssUQU5ulrX5llikCH0pvSq+rJnmY9uOduTNAks+lrH1A3e0qQAkHmqb+gMNGvvewexE4diElj0wXKEHMPRotNlK/hh7UBl0wyGZaZExAMoPrnRLn8PYnSRuXwqC+pm7p7wX8iJ6HJI5YCpO1JksKRXDshBq1IsGWQbdOyWYP0KuVEdjgml2CBmiUafVKJ2QWUpimOBtUNVn2mkw8sgt7JXqD/B7RlSoGQXgHezfqE0mSjPjkZ/vfGv/wBYf+Q1zHpZg8kGH3nnslSxKFqqNJ21TYDH3Mf6t+6dMCO6K8Umw/DsdWFZYEVCdwX9cdMQZzD3jKHZ2LltOn/+j5/+8Sev/u2od+Q97zlgwRkbSe9c2el+FveY/NEXv3jl9M///vlRzzOCPO87P/7TgedvkroEe4jVGZX1sLZACIsIAi3Cf09Cp2OG8B8DbbfqadsqxJbqjmN2UkmBH6RhJV9OgA0VXnGuNMn6IGeQ0L7NdZRTicLIcldS0yUbuTETNp6KwLSuZnG+cTuelFX6FNLYarKfyGRU8Vw6y6yrNUszkIUJLnPK7vZgsWnvfCXpgGBFjOL253iF2qS6/QfM1zvCcCtFtpmMFXmdAEDaIqoajU02yCIqSYdsSBEL0iIPEkY+oGMCbIzyqNFw1aU6ajlk/k6LJyR/VpSeBXLlOtkZEDCUrIgYQJf7RBnOogisBXL1cv64C2RIJtSCF9lyfdjIZ6km371M7tlu97Ih5bpJFnsZWQlpjzfJStaj8M/7mYKlCD9pTOMm2QL8e0RD+C1C2iRdpWnSyyKjFbNKwXNGAjTJalW3rUWFwe+xIKAheZNcXycf0fhTGpMhFBFJLookGpsu/YgPQq1IH5yV99eCoJvppcZdlDfDJzdxMiIhLhoPUiatBcaAW+7pjdXW9r3SVNUmF23NAMwjEQ04hBAYgxkT0VSLFH+2LzUgHpAFjAAjgjguo84If5xqFCFoEeDhKS6mXYik7d4hvukaGVuIb+sHuehHwPWJDhmBpNwhPQbzuERg8lcuX36NiD6BdMWi6kaQi8OQ+yHbBUdxRXAPIC8RmCJJqVIMNEnzy9UPMuRRBEJJxHY5CwjvoxzoFXScOdBINTymCvKAhJAUPQa+Z8YkBZqCDPsUG/o2uS9aKhTDYgpPomLIdQgZbBWYcM4UvcL7bpeEMzfTzqXTNAVPUdzA0AiQ3Ih0zu0sV13bB6rabjQmM/5ZDcm1Lzki1w47IlZTHoRl48oQJJgFXTh+eYbjFwhphFqnaqHTGQ6H7YHgsIIHos2TDi+P3joougXLsuXGtUMdR+9gqO7T3bemn34cMtgXS4IJYfDgYbomYWtoUBrSYhucOvWknKVjoegfaJfgYuaLRMRjCCaCIU0AQqHEkOsAam5/QYotUpPEDFKvQ1RCwQtQjnqiaQBFgqN9cLRzFjb5UyncbhD7p25JWCxsundnr00IfdJVoT0P2/tiqgFVgEj+ZBC5P0YeJkjOUe/LR705jAEzyJfis/WnLvruC740CFoiaSn32qUDm1AmWzdYC/04ib4Tjz6+C2u9FcJfKcDJZ258C4k+IMhn1wkSYohPkmPxYhkKtHcTN4OtbclT8khANzae8+ND4MdzgjwvFXOC/JRUlqeKIa/RmAO07EVjMIGSmCc8zmKc5jWI3Ij0hNgBZ8BD43gaM7Jxf3OO0YeF0U/Ot+eI+7Qh7hxk5yC7D8jie/gcY9etvyYPAYoqbYwN8iWMHfhEOjmYbFtpQekk4xSTf3Ms/ipi8dccXOcnH/8/6Dw07Jw+RegjDppzgmnoLB+UqNlYFnjBEBa0AbtGg3zASEghuAOhgZwGeNKqQ+qiM8Cwi0wS+/6PoDsSZlCMsGAAfnmYRALmBSPdpUJwGx7qvlH1hamijzulbZJhyBIyFplhw8ZDvUzxhCnldKNWm7vFDOykyRvbry+bIIznQP30APX8iHoO1F8DoH4ijnuDtVRsj3hBwzp32LX3qNbBLNolMsRjP8cu95Kpvc+IHhsD4CGcBXTs3IPeRzTFFYz3yvCEYaXKgs1RA/S3h5jVbLJSgRCDBkriLNK8FbFBR9pzZneM3CRmKmsTPt6lPHKHHYBCEEmucSNVthvNgOe+tocejPohhgrNRfft8iADE0DdAYj3fbHHZfa9HAtA2DNETefHBE8dQM7PDJ7xmwslczR398EIkaWifG1WQBRa6osEUNCAVDluOVMa1jg4DNGtbTFEkSyJeMyxqyHdPR5xPUam5U/mWdNdKQjRvBn3HPByPUiCHKFynNNogB9z/+HiFbBLQDA1i8nr5ApEABIOJFzCsrUXJxfmxLcm8b1y+YBlYKFEfqOCmEJUeV5ZgZNge3gr+1ARtj0Jnk80nWtfynQOBZ4Qh6p4s3/IpnsZi2bXycOYa93yaO4jTK7Ix9g9K0KHUktq1pDGlgbiCCyvQ9z/3qxN7NzABYScnQHU6Kupry41C4EL5Nrlsn1/plfIuXLVdL8yLabaPmeEXy1GOEVGjHefcAt3IM4xKq7Te+Y6vTcy3xBesHfabcXLs990fWfP/Xv8vVS0njStJw/w4af7KuC3//zha6uj371gbuafzL8VcJ8HTN7D924ugV/RuT0BqR80CTVo0hOQwUAfxow6smASlNy4bJvaxtoHIOBn94V2W0n8GtiGB5xKIQmRYYU8CiCybjwmF65WiHIhHXqZQTSB7S0EPhRE2k/AFcHVxAEAIcc5kggft4+wopQRgQeUQNQGkDhjwnapn5k4lsb9ZRGnplEgDXChk7sYeVS5mgzAM+ElM7ksgUCifHxrpLTMfHvHR+ILJvAHSJiliKRSwE4WOvTG+Q0hjq346iloIgMcSq41TB80mu84ACUw3/A3dbZVlAMBjYgv2RBZYgwtarbR5QzfhcJQIkDpN9pnwE5zt2mzFB7vq99MSDLHxRARBBUwhNloQhohSQbeyuMUstBATcR3ADFYosREe5OAI0EYRBZGxsIRZkOijeqmeUMX4SEBngVURxZnHmVKubNwEohBJfs2Zk3fOBUyZAPWjHHyg9EY5o3r0GdI+A27hfD1BJWBzUkufUn7upR8C/M6lWyQuEzeYxCgfp6vgMh511LCqyuCJCAkt4rlH7Ma0o8LQrdnfCOEv1dh+Ntb0Au14YUSwELYc5hr1Qq1qaz3CPyGM0Xz+wKrH3b2Id+Y5HRhH1j6tkvTVZS2CSsStRDz1dXjwGnGR0POziO/nqQq4OSEueWzPH1KY78rNEdF1QszjtAXgVS4MTNSYEYwxY4tHeiIZDy1WbG7gLzQXAWWIjKMrjlr4jJflsWbYdu/Tbr9SuLYoyoFQ8A0Z6TGlxXw17gsRWrHYoEpg0uYPGggisEE2aURh8fmc3TUz2ectmHNdfmGiN6EWsdtSmF1LzAE/JPpUEj+qVXoOACMjM2uTKny4EuZul/xJ25i1ZSi9j7pcNNpfIIY5kTL5MrEZ2S5xD0N6cxu0PZfOM4IauRFAAA=",
                                        "$": {
                                            "FareInfoRef": "7RlXH6SqWDKAAlQADAAAAA==",
                                            "ProviderCode": "ACH"
                                        }
                                    },
                                    "air:Brand": {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAAlQADAAAAA==",
                                            "BrandID": "2002637",
                                            "Name": "Flexi Plus Fare",
                                            "UpSellBrandFound": "false",
                                            "Carrier": "6E"
                                        },
                                        "air:Title": [
                                            {
                                                "_": "Flexible Plus Fare",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            {
                                                "_": "Flexi Plus",
                                                "$": {
                                                    "Type": "Short",
                                                    "LanguageCode": "EN"
                                                }
                                            }
                                        ],
                                        "air:Text": [
                                            {
                                                "$": {
                                                    "Type": "ATPCO",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            {
                                                "_": "Flexi Plus Fare:\n\n- Fare which will allow passenger to choose a \n- Complimentary  Meal,                                                                              \n- 15kg checked baggage\n-Complimentary Standard Seat,XL seat at 50% discount\n-***No Date Change Fee, for 4 Days and Above left for departure\n-***Lower cancellation fee, for 4 Days and Above left for departure\n- 7 kg  hand baggage allowance\n***Rescheduling allowed with difference of fare, adhering to conditions 0-3 days before departure*: Up to INR 3000 , 4 days * & above before departure: No Fee\n***Cancellation allowed adhering to conditions 0-3 days before departure*: Up to INR 3500, 4 days * & above before departure: INR 500\n- Refundable adhering to Terms & conditions\n- No show PNR / ticket is not allowed to reschedule the journey\n\n***Kindly note that operations will be rescheduled / cancelled subject to last minute changes\n• Please note that if the flight is operated by another airline, then the onboard product or service may be different to that described above. The content on this screen is for information purposes only. Please validate brands and ancillaries at Fare Quote.",
                                                "$": {
                                                    "Type": "MarketingConsumer",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            {
                                                "_": "Attractive deal providing flexibility to make unlimited changes to travel dates without incurring change fee",
                                                "$": {
                                                    "Type": "Upsell",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            {
                                                "_": "Flexi Plus Fare:\n\n- Fare which will allow passenger to choose a \n- Complimentary  Meal,                                                                              \n- 15kg checked baggage\n-Complimentary Standard Seat,XL seat at 50% discount\n-***No Date Change Fee, for 4 Days and Above left for departure\n-***Lower cancellation fee, for 4 Days and Above left for departure\n- 7 kg  hand baggage allowance\n***Rescheduling allowed with difference of fare, adhering to conditions 0-3 days before departure*: Up to INR 3000 , 4 days * & above before departure: No Fee\n***Cancellation allowed adhering to conditions 0-3 days before departure*: Up to INR 3500, 4 days * & above before departure: INR 500\n- Refundable adhering to Terms & conditions\n- No show PNR / ticket is not allowed to reschedule the journey\n\n***Kindly note that operations will be rescheduled / cancelled subject to last minute changes\n• Please note that if the flight is operated by another airline, then the onboard product or service may be different to that described above. The content on this screen is for information purposes only. Please validate brands and ancillaries at Fare Quote.",
                                                "$": {
                                                    "Type": "MarketingAgent",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            {
                                                "_": "Flexi Plus Fare",
                                                "$": {
                                                    "Type": "Strapline",
                                                    "LanguageCode": "EN"
                                                }
                                            }
                                        ],
                                        "air:ImageLocation": [
                                            {
                                                "_": "https://cdn.travelport.com/indigo/6E_general_medium_281032.jpg",
                                                "$": {
                                                    "Type": "Consumer",
                                                    "ImageWidth": "150",
                                                    "ImageHeight": "150"
                                                }
                                            },
                                            {
                                                "_": "https://cdn.travelport.com/indigo/6E_general_medium_281032.jpg",
                                                "$": {
                                                    "Type": "Agent",
                                                    "ImageWidth": "150",
                                                    "ImageHeight": "150"
                                                }
                                            }
                                        ],
                                        "air:OptionalServices": {
                                            "air:OptionalService": [
                                                {
                                                    "$": {
                                                        "Type": "Baggage",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "Key": "7RlXH6SqWDKABlQADAAAAA==",
                                                        "Chargeable": "Included in the brand",
                                                        "OptionalServicesRuleRef": "7RlXH6SqWDKAClQADAAAAA==",
                                                        "Tag": "Other",
                                                        "DisplayOrder": "999"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "Checked baggage 15kg",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_46074.jpg"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_46074.jpg"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:EMD": {
                                                        "$": {
                                                            "AssociatedItem": "Flight"
                                                        }
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "Check in your bags for extra convenience",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "1x15kg",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "1x15kg",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "Checked baggage 15kg",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "bag 15k",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "Baggage",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "Key": "7RlXH6SqWDKADlQADAAAAA==",
                                                        "SecondaryType": "CY",
                                                        "Chargeable": "Included in the brand",
                                                        "OptionalServicesRuleRef": "7RlXH6SqWDKAElQADAAAAA==",
                                                        "Tag": "Carry On Hand Baggage",
                                                        "DisplayOrder": "2"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "Carry on hand baggage 7kg",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52738.jpg"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52738.jpg"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:EMD": {
                                                        "$": {
                                                            "AssociatedItem": "Flight"
                                                        }
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "Taking bags on board",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "For both Domestic and International flights\na hand baggage of 7kg is allowed to carry along, to place at over head bin or beneath the passengers seat.\n\n*Corporate Fare: 10kg hand baggage\n\n*Code Share flights : 8kg hand baggage\n\nIts should not exceed \nlength 55cm + width 35cm + height 25cm.\n\n***In the event a piece of Hand baggage is over-sized or over-weight, IndiGo may require transfer of such Hand Baggage to the Checked-in Baggage compartment of the aircraft prior to take-off.",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "For both Domestic and International flights\na hand baggage of 7kg is allowed to carry along, to place at over head bin or beneath the passengers seat.\n\n*Corporate Fare: 10kg hand baggage\n\n*Code Share flights : 8kg hand baggage\n\nIts should not exceed \nlength 55cm + width 35cm + height 25cm.\n\n***In the event a piece of Hand baggage is over-sized or over-weight, IndiGo may require transfer of such Hand Baggage to the Checked-in Baggage compartment of the aircraft prior to take-off.",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "Carry on hand baggage 7kg",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "CarryBag",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "Baggage",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "Key": "7RlXH6SqWDKAFlQADAAAAA==",
                                                        "SecondaryType": "XS",
                                                        "Chargeable": "Available for a charge",
                                                        "Tag": "Other",
                                                        "DisplayOrder": "999"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "Prepaid excess baggage",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:EMD": {
                                                        "$": {
                                                            "AssociatedItem": "Flight"
                                                        }
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "Prepaid excess baggage",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Pack more and save more with our prepaid baggage service.",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Pack more and save more with our prepaid baggage service.",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "Prepaid excess baggage",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Excess Bag",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "Branded Fares",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "ServiceSubCode": "",
                                                        "Key": "7RlXH6SqWDKAGlQADAAAAA==",
                                                        "SecondaryType": "RF",
                                                        "Chargeable": "Available for a charge",
                                                        "Tag": "Refund",
                                                        "DisplayOrder": "4"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "Refund",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_3895.jpg"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_3895.jpg"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "In case of any sudden reasons, you cannot follow the initial itinerary and have the need of returning/exchanging the tickets.\nFor detailed information, please consult with the agents or Brand representatives.",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "In case of any sudden reasons, you cannot follow the initial itinerary and have the need of returning/exchanging the tickets.\nFor detailed information, please consult with the agents or Brand representatives.",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "Refund",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Refund",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "Branded Fares",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "ServiceSubCode": "",
                                                        "Key": "7RlXH6SqWDKAHlQADAAAAA==",
                                                        "SecondaryType": "VC",
                                                        "Chargeable": "Available for a charge",
                                                        "Tag": "Rebooking",
                                                        "DisplayOrder": "3"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "Rebooking",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_3895.jpg"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_3895.jpg"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "Rebooking",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "We apply the policy which allows passengers to flexibly change Flight Date/ Itinerary based on ticket class. For more details, please consult with the agents and our brand representatives.",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "We apply the policy which allows passengers to flexibly change Flight Date/ Itinerary based on ticket class. For more details, please consult with the agents and our brand representatives.",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "Rebooking",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "RuleOverride",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "Key": "7RlXH6SqWDKAIlQADAAAAA==",
                                                        "SecondaryType": "31",
                                                        "Chargeable": "Available for a charge",
                                                        "Tag": "Rebooking",
                                                        "DisplayOrder": "3"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "Changeable",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52742.jpg"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52742.jpg"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:EMD": {
                                                        "$": {
                                                            "AssociatedItem": "Flight"
                                                        }
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "Changeable",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Changeable ticket",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Changeable ticket",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "Changeable",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Changeable",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "RuleOverride",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "Key": "7RlXH6SqWDKAJlQADAAAAA==",
                                                        "SecondaryType": "33",
                                                        "Chargeable": "Available for a charge",
                                                        "Tag": "Refund",
                                                        "DisplayOrder": "4"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "Refunds",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52743.jpg"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52743.jpg"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:EMD": {
                                                        "$": {
                                                            "AssociatedItem": "Flight"
                                                        }
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "Rebooking and Refund",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Upon failure by IndiGo to provide carriage in accordance with these Conditions of Carriage, or where a Customer requests a voluntary change of his arrangements, refund for an unused Booking, or portion thereof shall be made by IndiGo in accordance with this Article and in accordance with IndiGo’s regulations, after deducting the applicable fees and charges.\n\nRefunds against the residual value after deduction of the applicable fee will be made available as per the following:\n\nFor Bookings made through credit/debit cards, the refund will be processed back to the credit/debit card.\n\nFor Bookings made through net banking, the refund will be processed into the same bank account.\n\nFor Bookings made through Travel Partners or online travel portals, the refund may be claimed from the respective travel agents/ portals.\n\nFor Bookings made by cash at the airport, the refund will be processed at the respective airport.",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Upon failure by IndiGo to provide carriage in accordance with these Conditions of Carriage, or where a Customer requests a voluntary change of his arrangements, refund for an unused Booking, or portion thereof shall be made by IndiGo in accordance with this Article and in accordance with IndiGo’s regulations, after deducting the applicable fees and charges.\n\nRefunds against the residual value after deduction of the applicable fee will be made available as per the following:\n\nFor Bookings made through credit/debit cards, the refund will be processed back to the credit/debit card.\n\nFor Bookings made through net banking, the refund will be processed into the same bank account.\n\nFor Bookings made through Travel Partners or online travel portals, the refund may be claimed from the respective travel agents/ portals.\n\nFor Bookings made by cash at the airport, the refund will be processed at the respective airport.",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "Refunds",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Refunds",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "PreReservedSeatAssignment",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "Key": "7RlXH6SqWDKAKlQADAAAAA==",
                                                        "Chargeable": "Included in the brand",
                                                        "Tag": "Seat Assignment",
                                                        "DisplayOrder": "5"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "Advance Seat Selection",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52739.jpg"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52739.jpg"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:EMD": {
                                                        "$": {
                                                            "AssociatedItem": "Flight"
                                                        }
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "Your preferred choice of seat",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Pre paid seat selection is allowed with applicable charges according to the seat and aircraft type, except code share flights.",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Pre paid seat selection is allowed with applicable charges according to the seat and aircraft type, except code share flights.",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "Advance Seat Selection",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Adv Seat",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "PreReservedSeatAssignment",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "Key": "7RlXH6SqWDKALlQADAAAAA==",
                                                        "Chargeable": "Available for a charge",
                                                        "Tag": "Seat Assignment",
                                                        "DisplayOrder": "5"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "Choice Seats",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_143574.jpg"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_143574.jpg"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:EMD": {
                                                        "$": {
                                                            "AssociatedItem": "Flight"
                                                        }
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "Your preferred choice of seat",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Choice Seats: Aisle , Window and Extra leg room\n\nExtra leg room seat rows at aircrafts is as follows:\nATR- 1st and 2nd rows\nA320- 1st, 12th and 13th rows\nA321- 1st, 17th ,18th and 27th rows",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Choice Seats: Aisle , Window and Extra leg room\n\nExtra leg room seat rows at aircrafts is as follows:\nATR- 1st and 2nd rows\nA320- 1st, 12th and 13th rows\nA321- 1st, 17th ,18th and 27th rows",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "Choice Seats",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Seat",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "MealOrBeverage",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "ServiceSubCode": "",
                                                        "Key": "7RlXH6SqWDKAMlQADAAAAA==",
                                                        "Chargeable": "Available for a charge",
                                                        "Tag": "Meals and Beverages",
                                                        "DisplayOrder": "6"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "6E Eats",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "194",
                                                                    "width": "292",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_small_602320.PNG"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_small_602319.png"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:EMD": {
                                                        "$": {
                                                            "AssociatedItem": "Flight"
                                                        }
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "6E Eats",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Delectable preparations now on-board. Bookings open.",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Delectable preparations now on-board. Bookings open.",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "6E Eats",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Meal",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "InFlightEntertainment",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "Key": "7RlXH6SqWDKANlQADAAAAA==",
                                                        "SecondaryType": "IT",
                                                        "Chargeable": "Available for a charge",
                                                        "Tag": "WiFi",
                                                        "DisplayOrder": "7"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "In Flight Entertainment",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "58",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_143589.png"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "58",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_143589.png"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "In Flight Entertainment",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Inflight Magazine is available with no charges applied.\n\nSonyLIV inflight entertainment with a starting subscription charge is available on all our flights.",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Inflight Magazine is available with no charges applied.\n\nSonyLIV inflight entertainment with a starting subscription charge is available on all our flights.",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "In Flight Entertainment",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "In Flight",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "InFlightEntertainment",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "ServiceSubCode": "",
                                                        "Key": "7RlXH6SqWDKAOlQADAAAAA==",
                                                        "SecondaryType": "IT",
                                                        "Chargeable": "Not offered",
                                                        "Tag": "WiFi",
                                                        "DisplayOrder": "7"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "myPAL WiFi",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52741.jpg"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52741.jpg"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:EMD": {
                                                        "$": {
                                                            "AssociatedItem": "Flight"
                                                        }
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "Stay connected on board",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "myPAL WiFi",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "myPAL WiFi",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "myPAL WiFi",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "myPAL WiFi",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    "$": {
                                                        "Type": "Lounge",
                                                        "CreateDate": "2026-06-03T12:25:54.019+00:00",
                                                        "Key": "7RlXH6SqWDKAPlQADAAAAA==",
                                                        "Chargeable": "Available for a charge",
                                                        "Tag": "Lounge Access",
                                                        "DisplayOrder": "10"
                                                    },
                                                    "common_v54_0:ServiceData": {
                                                        "$": {
                                                            "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                        }
                                                    },
                                                    "common_v54_0:ServiceInfo": {
                                                        "common_v54_0:Description": "Lounge access",
                                                        "common_v54_0:MediaItem": [
                                                            {
                                                                "$": {
                                                                    "caption": "Consumer",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52746.jpg"
                                                                }
                                                            },
                                                            {
                                                                "$": {
                                                                    "caption": "Agent",
                                                                    "height": "60",
                                                                    "width": "60",
                                                                    "url": "https://cdn.travelport.com/indigo/6E_general_medium_52746.jpg"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    "air:EMD": {
                                                        "$": {
                                                            "AssociatedItem": "Flight"
                                                        }
                                                    },
                                                    "air:Text": [
                                                        {
                                                            "_": "Lounge Access",
                                                            "$": {
                                                                "Type": "Strapline",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Make your guest's airport experience seamless and effortless, and through the airline's hearty services, IndiGo changes the perception of travel at the airport.",
                                                            "$": {
                                                                "Type": "MarketingAgent",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Make your airport experience seamless and effortless, and through the airline's hearty services, IndiGo changes the perception of travel at the airport.",
                                                            "$": {
                                                                "Type": "MarketingConsumer",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ],
                                                    "air:Title": [
                                                        {
                                                            "_": "Lounge access",
                                                            "$": {
                                                                "Type": "External",
                                                                "LanguageCode": "EN"
                                                            }
                                                        },
                                                        {
                                                            "_": "Lounge",
                                                            "$": {
                                                                "Type": "Short",
                                                                "LanguageCode": "EN"
                                                            }
                                                        }
                                                    ]
                                                }
                                            ],
                                            "air:OptionalServiceRules": [
                                                {
                                                    "$": {
                                                        "Key": "7RlXH6SqWDKAClQADAAAAA=="
                                                    },
                                                    "common_v54_0:Remarks": "Y,1,KG,15,BAG"
                                                },
                                                {
                                                    "$": {
                                                        "Key": "7RlXH6SqWDKAElQADAAAAA=="
                                                    },
                                                    "common_v54_0:Remarks": "Y,1,KG,7,CY - W25,H35,L55,CM"
                                                }
                                            ]
                                        }
                                    }
                                },
                                "air:BookingInfo": {
                                    "$": {
                                        "BookingCode": "Y",
                                        "CabinClass": "Economy",
                                        "FareInfoRef": "7RlXH6SqWDKAAlQADAAAAA==",
                                        "SegmentRef": "7RlXH6SqWDKAzkQADAAAAA==",
                                        "HostTokenRef": "7RlXH6SqWDKA0kQADAAAAA=="
                                    }
                                },
                                "air:TaxInfo": [
                                    {
                                        "$": {
                                            "Category": "DU",
                                            "CarrierDefinedCategory": "RCF",
                                            "Amount": "INR50.00",
                                            "Key": "7RlXH6SqWDKA4kQADAAAAA==",
                                            "ProviderCode": "ACH",
                                            "SupplierCode": "6E"
                                        }
                                    },
                                    {
                                        "$": {
                                            "Category": "DU",
                                            "CarrierDefinedCategory": "ASF",
                                            "Amount": "INR236.00",
                                            "Key": "7RlXH6SqWDKA5kQADAAAAA==",
                                            "ProviderCode": "ACH",
                                            "SupplierCode": "6E"
                                        }
                                    },
                                    {
                                        "$": {
                                            "Category": "DU",
                                            "CarrierDefinedCategory": "UDF",
                                            "Amount": "INR885.00",
                                            "Key": "7RlXH6SqWDKA6kQADAAAAA==",
                                            "ProviderCode": "ACH",
                                            "SupplierCode": "6E"
                                        }
                                    },
                                    {
                                        "$": {
                                            "Category": "DU",
                                            "CarrierDefinedCategory": "TTF",
                                            "Amount": "INR98.00",
                                            "Key": "7RlXH6SqWDKA7kQADAAAAA==",
                                            "ProviderCode": "ACH",
                                            "SupplierCode": "6E"
                                        }
                                    },
                                    {
                                        "$": {
                                            "Category": "YQ",
                                            "Amount": "INR400.00",
                                            "Key": "7RlXH6SqWDKA8kQADAAAAA==",
                                            "ProviderCode": "ACH",
                                            "SupplierCode": "6E"
                                        }
                                    },
                                    {
                                        "$": {
                                            "Category": "DU",
                                            "CarrierDefinedCategory": "UDFA",
                                            "Amount": "INR89.00",
                                            "Key": "7RlXH6SqWDKA9kQADAAAAA==",
                                            "ProviderCode": "ACH",
                                            "SupplierCode": "6E"
                                        }
                                    },
                                    {
                                        "$": {
                                            "Category": "DU",
                                            "CarrierDefinedCategory": "36GST",
                                            "Amount": "INR150.00",
                                            "Key": "7RlXH6SqWDKA+kQADAAAAA==",
                                            "ProviderCode": "ACH",
                                            "SupplierCode": "6E"
                                        }
                                    },
                                    {
                                        "$": {
                                            "Category": "DU",
                                            "CarrierDefinedCategory": "PHF",
                                            "Amount": "INR50.00",
                                            "Key": "7RlXH6SqWDKA/kQADAAAAA==",
                                            "ProviderCode": "ACH",
                                            "SupplierCode": "6E"
                                        }
                                    }
                                ],
                                "air:PassengerType": {
                                    "$": {
                                        "Code": "ADT",
                                        "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA=="
                                    }
                                }
                            },
                            "air:TaxInfo": [
                                {
                                    "$": {
                                        "Category": "DU",
                                        "CarrierDefinedCategory": "RCF",
                                        "Amount": "INR50.00",
                                        "Key": "7RlXH6SqWDKAsnQADAAAAA==",
                                        "ProviderCode": "ACH",
                                        "SupplierCode": "6E"
                                    }
                                },
                                {
                                    "$": {
                                        "Category": "YQ",
                                        "Amount": "INR400.00",
                                        "Key": "7RlXH6SqWDKAtnQADAAAAA==",
                                        "ProviderCode": "ACH",
                                        "SupplierCode": "6E"
                                    }
                                },
                                {
                                    "$": {
                                        "Category": "DU",
                                        "CarrierDefinedCategory": "UDF",
                                        "Amount": "INR885.00",
                                        "Key": "7RlXH6SqWDKAunQADAAAAA==",
                                        "ProviderCode": "ACH",
                                        "SupplierCode": "6E"
                                    }
                                },
                                {
                                    "$": {
                                        "Category": "DU",
                                        "CarrierDefinedCategory": "TTF",
                                        "Amount": "INR98.00",
                                        "Key": "7RlXH6SqWDKAvnQADAAAAA==",
                                        "ProviderCode": "ACH",
                                        "SupplierCode": "6E"
                                    }
                                },
                                {
                                    "$": {
                                        "Category": "DU",
                                        "CarrierDefinedCategory": "UDFA",
                                        "Amount": "INR89.00",
                                        "Key": "7RlXH6SqWDKAwnQADAAAAA==",
                                        "ProviderCode": "ACH",
                                        "SupplierCode": "6E"
                                    }
                                },
                                {
                                    "$": {
                                        "Category": "DU",
                                        "CarrierDefinedCategory": "ASF",
                                        "Amount": "INR236.00",
                                        "Key": "7RlXH6SqWDKAxnQADAAAAA==",
                                        "ProviderCode": "ACH",
                                        "SupplierCode": "6E"
                                    }
                                },
                                {
                                    "$": {
                                        "Category": "DU",
                                        "CarrierDefinedCategory": "PHF",
                                        "Amount": "INR50.00",
                                        "Key": "7RlXH6SqWDKAynQADAAAAA==",
                                        "ProviderCode": "ACH",
                                        "SupplierCode": "6E"
                                    }
                                },
                                {
                                    "$": {
                                        "Category": "DU",
                                        "CarrierDefinedCategory": "36GST",
                                        "Amount": "INR150.00",
                                        "Key": "7RlXH6SqWDKAznQADAAAAA==",
                                        "ProviderCode": "ACH",
                                        "SupplierCode": "6E"
                                    }
                                }
                            ],
                            "common_v54_0:HostToken": {
                                "_": "NNS6E{IS###}INR{CC###ET}ACHSDv01LPD1:bd356f8d-31b7-40dc-a0aa-0ef401c55523",
                                "$": {
                                    "Key": "7RlXH6SqWDKA0kQADAAAAA=="
                                }
                            },
                            "air:OptionalServices": {
                                "air:OptionalServicesTotal": "",
                                "air:OptionalService": [
                                    {
                                        "$": {
                                            "Type": "MealOrBeverage",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKARlQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Meal, 6E curated snack bag",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "ML__FR",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKASlQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "6E curated snack bag - 6E curated snack bag",
                                                "Corporate fare bookings includes unlimited flexibility to change/cancel, complimentary seat, extra hand-baggage allowance and a complimentary snack combo per origin and destination. - 6E curated snack bag",
                                                "Corporate fare bookings get complementary meal only on the long-sector segments of a via flight. - 6E curated snack bag",
                                                "Retail fare bookings can purchase meal only on long sector segments of a connecting or via flight. - 6E curated snack bag"
                                            ]
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI3",
                                                "CommercialName": "6E curated snack bag"
                                            },
                                            "air:Title": {
                                                "_": "6E curated snack bag",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "MealOrBeverage",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKATlQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Meal, Paneer Tikka Sandwich Combo",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "MLSNVGZ2",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAUlQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Paneer Tikka Sandwich Combo - Paneer Tikka Sandwich Combo",
                                                "Corporate fare bookings includes unlimited flexibility to change/cancel, complimentary seat, extra hand-baggage allowance and a complimentary snack combo per origin and destination. - Paneer Tikka Sandwich Combo",
                                                "Corporate fare bookings get complementary meal only on the long-sector segments of a via flight. - Paneer Tikka Sandwich Combo",
                                                "Retail fare bookings can purchase meal only on long sector segments of a connecting or via flight. - Paneer Tikka Sandwich Combo"
                                            ]
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI38",
                                                "ServiceType": "F",
                                                "CommercialName": "Paneer Tikka Sandwich Combo"
                                            },
                                            "air:Text": [
                                                {
                                                    "_": "Tiffin",
                                                    "$": {
                                                        "Type": "Strapline",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pre-book snacks before you fly\nNow pre-book your favourite from a range of delectable snacks on the 6E Tiffin menu and save up to 15%.\nRefer to options and terms and conditions via URL below\nhttps://www.goindigo.in/add-on-services/food-menu.html",
                                                    "$": {
                                                        "Type": "MarketingAgent",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pre-book snacks before you fly\nNow pre-book your favourite from a range of delectable snacks on the 6E Tiffin menu and save up to 15%.\nRefer to options and terms and conditions via URL below\nhttps://www.goindigo.in/add-on-services/food-menu.html",
                                                    "$": {
                                                        "Type": "MarketingConsumer",
                                                        "LanguageCode": "EN"
                                                    }
                                                }
                                            ],
                                            "air:Title": {
                                                "_": "Paneer Tikka Sandwich Combo",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:ImageLocation": [
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_193317.jpg",
                                                    "$": {
                                                        "Type": "Agent",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                },
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_193317.jpg",
                                                    "$": {
                                                        "Type": "Consumer",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                }
                                            ],
                                            "air:ServiceGroup": {
                                                "$": {
                                                    "Code": "ML"
                                                },
                                                "air:ServiceSubGroup": {
                                                    "$": {
                                                        "Code": "SN"
                                                    }
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "MealOrBeverage",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAVlQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Meal, Chicken Junglee Sandwich and Beverage",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "MLSNCNZ2",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAWlQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Chicken Junglee Sandwich and Beverage - Chicken Junglee Sandwich and Beverage",
                                                "Corporate fare bookings includes unlimited flexibility to change/cancel, complimentary seat, extra hand-baggage allowance and a complimentary snack combo per origin and destination. - Chicken Junglee Sandwich and Beverage",
                                                "Corporate fare bookings get complementary meal only on the long-sector segments of a via flight. - Chicken Junglee Sandwich and Beverage",
                                                "Retail fare bookings can purchase meal only on long sector segments of a connecting or via flight. - Chicken Junglee Sandwich and Beverage"
                                            ]
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI51",
                                                "ServiceType": "F",
                                                "CommercialName": "Chicken Junglee Sandwich and Beverage"
                                            },
                                            "air:Text": [
                                                {
                                                    "_": "Tiffin",
                                                    "$": {
                                                        "Type": "Strapline",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pre-book snacks before you fly\nNow pre-book your favourite from a range of delectable snacks on the 6E Tiffin menu and save up to 15%.\nRefer to options and terms and conditions via URL below\nhttps://www.goindigo.in/add-on-services/food-menu.html",
                                                    "$": {
                                                        "Type": "MarketingAgent",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pre-book snacks before you fly\nNow pre-book your favourite from a range of delectable snacks on the 6E Tiffin menu and save up to 15%.\nRefer to options and terms and conditions via URL below\nhttps://www.goindigo.in/add-on-services/food-menu.html",
                                                    "$": {
                                                        "Type": "MarketingConsumer",
                                                        "LanguageCode": "EN"
                                                    }
                                                }
                                            ],
                                            "air:Title": {
                                                "_": "Chicken Junglee Sandwich and Beverage",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:ImageLocation": [
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_193317.jpg",
                                                    "$": {
                                                        "Type": "Agent",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                },
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_193317.jpg",
                                                    "$": {
                                                        "Type": "Consumer",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                }
                                            ],
                                            "air:ServiceGroup": {
                                                "$": {
                                                    "Code": "ML"
                                                },
                                                "air:ServiceSubGroup": {
                                                    "$": {
                                                        "Code": "SN"
                                                    }
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "MealOrBeverage",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAXlQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Meal, Jain meal and beverage",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "ML__VGZ8",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAYlQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Jain meal and beverage - Jain meal and beverage",
                                                "Corporate fare bookings includes unlimited flexibility to change/cancel, complimentary seat, extra hand-baggage allowance and a complimentary snack combo per origin and destination. - Jain meal and beverage",
                                                "Corporate fare bookings get complementary meal only on the long-sector segments of a via flight. - Jain meal and beverage",
                                                "Retail fare bookings can purchase meal only on long sector segments of a connecting or via flight. - Jain meal and beverage"
                                            ]
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI2",
                                                "CommercialName": "Jain meal and beverage"
                                            },
                                            "air:Title": {
                                                "_": "Jain meal and beverage",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "MealOrBeverage",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAZlQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Meal, 6E Eats choice of the day (non-veg) and beverage",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "ML__CNYC",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAalQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "6E Eats choice of the day (non-veg) and beverage - 6E Eats choice of the day (non-veg) and beverage",
                                                "Corporate fare bookings includes unlimited flexibility to change/cancel, complimentary seat, extra hand-baggage allowance and a complimentary snack combo per origin and destination. - 6E Eats choice of the day (non-veg) and beverage",
                                                "Corporate fare bookings get complementary meal only on the long-sector segments of a via flight. - 6E Eats choice of the day (non-veg) and beverage",
                                                "Retail fare bookings can purchase meal only on long sector segments of a connecting or via flight. - 6E Eats choice of the day (non-veg) and beverage"
                                            ]
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI60",
                                                "CommercialName": "6E Eats choice of the day (non-veg) and beverage"
                                            },
                                            "air:Title": {
                                                "_": "6E Eats choice of the day (non-veg) and beverage",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "MealOrBeverage",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAblQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Meal, 6E Eats choice of the day (veg) and beverage",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "ML__VGZM",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAclQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "6E Eats choice of the day (veg) and beverage - 6E Eats choice of the day (veg) and beverage",
                                                "Corporate fare bookings includes unlimited flexibility to change/cancel, complimentary seat, extra hand-baggage allowance and a complimentary snack combo per origin and destination. - 6E Eats choice of the day (veg) and beverage",
                                                "Corporate fare bookings get complementary meal only on the long-sector segments of a via flight. - 6E Eats choice of the day (veg) and beverage",
                                                "Retail fare bookings can purchase meal only on long sector segments of a connecting or via flight. - 6E Eats choice of the day (veg) and beverage"
                                            ]
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI39",
                                                "CommercialName": "6E Eats choice of the day (veg) and beverage"
                                            },
                                            "air:Title": {
                                                "_": "6E Eats choice of the day (veg) and beverage",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "MealOrBeverage",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAdlQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Meal, IndiaByIndiaGo regional favourite (veg) and beverage",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "ML__VGZN",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAelQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "IndiaByIndiaGo regional favourite (veg) and beverage - IndiaByIndiaGo regional favourite (veg) and beverage",
                                                "Corporate fare bookings includes unlimited flexibility to change/cancel, complimentary seat, extra hand-baggage allowance and a complimentary snack combo per origin and destination. - IndiaByIndiaGo regional favourite (veg) and beverage",
                                                "Corporate fare bookings get complementary meal only on the long-sector segments of a via flight. - IndiaByIndiaGo regional favourite (veg) and beverage",
                                                "Retail fare bookings can purchase meal only on long sector segments of a connecting or via flight. - IndiaByIndiaGo regional favourite (veg) and beverage"
                                            ]
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI7",
                                                "CommercialName": "IndiaByIndiaGo regional favourite (veg) and beverage"
                                            },
                                            "air:Title": {
                                                "_": "IndiaByIndiaGo regional favourite (veg) and beverage",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "MealOrBeverage",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAflQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Meal, Diabetic veg meal and beverage",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "ML__SHZ6",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAglQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Diabetic veg meal and beverage - Diabetic veg meal and beverage",
                                                "Corporate fare bookings includes unlimited flexibility to change/cancel, complimentary seat, extra hand-baggage allowance and a complimentary snack combo per origin and destination. - Diabetic veg meal and beverage",
                                                "Corporate fare bookings get complementary meal only on the long-sector segments of a via flight. - Diabetic veg meal and beverage",
                                                "Retail fare bookings can purchase meal only on long sector segments of a connecting or via flight. - Diabetic veg meal and beverage"
                                            ]
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI8",
                                                "CommercialName": "Diabetic veg meal and beverage"
                                            },
                                            "air:Title": {
                                                "_": "Diabetic veg meal and beverage",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "MealOrBeverage",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAhlQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Meal, Vegan meal and beverage",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "ML__SHZ7",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAilQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Vegan meal and beverage - Vegan meal and beverage",
                                                "Corporate fare bookings includes unlimited flexibility to change/cancel, complimentary seat, extra hand-baggage allowance and a complimentary snack combo per origin and destination. - Vegan meal and beverage",
                                                "Corporate fare bookings get complementary meal only on the long-sector segments of a via flight. - Vegan meal and beverage",
                                                "Retail fare bookings can purchase meal only on long sector segments of a connecting or via flight. - Vegan meal and beverage"
                                            ]
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI66",
                                                "CommercialName": "Vegan meal and beverage"
                                            },
                                            "air:Title": {
                                                "_": "Vegan meal and beverage",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "Baggage",
                                            "TotalPrice": "INR1212.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAjlQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Baggage, 3kg",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "BGXS03",
                                            "BasePrice": "INR1212.00",
                                            "ApproximateTotalPrice": "INR1212.00",
                                            "ApproximateBasePrice": "INR1212.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAllQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Check-in baggage - up to 3kg - Check-in baggage - up to 3kg",
                                                "Excess baggage does not include Special Baggage Charges (charges levied on sporting equipment, skiing equipment, LED/LCD etc.) which shall attract charges over and above. If a passenger is carrying any special baggage, it shall warrant an additional free, which can be paid at the time of check-in. - Check-in baggage - up to 3kg"
                                            ]
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAklQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI5",
                                                "ServiceType": "F",
                                                "CommercialName": "Check-in baggage - up to 3kg"
                                            },
                                            "air:Text": [
                                                {
                                                    "_": "Prepaid excess baggage",
                                                    "$": {
                                                        "Type": "Strapline",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingAgent",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingConsumer",
                                                        "LanguageCode": "EN"
                                                    }
                                                }
                                            ],
                                            "air:Title": {
                                                "_": "Check-in baggage - up to 3kg",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:ImageLocation": [
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Consumer",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                },
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Agent",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                }
                                            ],
                                            "air:ServiceGroup": {
                                                "$": {
                                                    "Code": "BG"
                                                },
                                                "air:ServiceSubGroup": {
                                                    "$": {
                                                        "Code": "XS"
                                                    }
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "Baggage",
                                            "TotalPrice": "INR2020.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAmlQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Baggage, 5kg",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "BGXS05",
                                            "BasePrice": "INR2020.00",
                                            "ApproximateTotalPrice": "INR2020.00",
                                            "ApproximateBasePrice": "INR2020.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAolQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Check-in baggage - up to 5kg - Check-in baggage - up to 5kg",
                                                "Excess baggage does not include Special Baggage Charges (charges levied on sporting equipment, skiing equipment, LED/LCD etc.) which shall attract charges over and above. If a passenger is carrying any special baggage, it shall warrant an additional free, which can be paid at the time of check-in. - Check-in baggage - up to 5kg"
                                            ]
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAnlQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI55",
                                                "ServiceType": "F",
                                                "CommercialName": "Check-in baggage - up to 5kg"
                                            },
                                            "air:Text": [
                                                {
                                                    "_": "Prepaid excess baggage",
                                                    "$": {
                                                        "Type": "Strapline",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingAgent",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingConsumer",
                                                        "LanguageCode": "EN"
                                                    }
                                                }
                                            ],
                                            "air:Title": {
                                                "_": "Check-in baggage - up to 5kg",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:ImageLocation": [
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Consumer",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                },
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Agent",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                }
                                            ],
                                            "air:ServiceGroup": {
                                                "$": {
                                                    "Code": "BG"
                                                },
                                                "air:ServiceSubGroup": {
                                                    "$": {
                                                        "Code": "XS"
                                                    }
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "Baggage",
                                            "TotalPrice": "INR4500.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAplQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Baggage, 10kg",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "BGXS10",
                                            "BasePrice": "INR4500.00",
                                            "ApproximateTotalPrice": "INR4500.00",
                                            "ApproximateBasePrice": "INR4500.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKArlQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Check-in baggage - up to 10kg - Check-in baggage - up to 10kg",
                                                "Excess baggage does not include Special Baggage Charges (charges levied on sporting equipment, skiing equipment, LED/LCD etc.) which shall attract charges over and above. If a passenger is carrying any special baggage, it shall warrant an additional free, which can be paid at the time of check-in. - Check-in baggage - up to 10kg"
                                            ]
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAqlQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI52",
                                                "ServiceType": "F",
                                                "CommercialName": "Check-in baggage - up to 10kg"
                                            },
                                            "air:Text": [
                                                {
                                                    "_": "Prepaid excess baggage",
                                                    "$": {
                                                        "Type": "Strapline",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingAgent",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingConsumer",
                                                        "LanguageCode": "EN"
                                                    }
                                                }
                                            ],
                                            "air:Title": {
                                                "_": "Check-in baggage - up to 10kg",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:ImageLocation": [
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Consumer",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                },
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Agent",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                }
                                            ],
                                            "air:ServiceGroup": {
                                                "$": {
                                                    "Code": "BG"
                                                },
                                                "air:ServiceSubGroup": {
                                                    "$": {
                                                        "Code": "XS"
                                                    }
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "Baggage",
                                            "TotalPrice": "INR5760.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAslQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Baggage, 15kg",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "BGXS15",
                                            "BasePrice": "INR5760.00",
                                            "ApproximateTotalPrice": "INR5760.00",
                                            "ApproximateBasePrice": "INR5760.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAulQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Check-in baggage - up to 15kg - Check-in baggage - up to 15kg",
                                                "Excess baggage does not include Special Baggage Charges (charges levied on sporting equipment, skiing equipment, LED/LCD etc.) which shall attract charges over and above. If a passenger is carrying any special baggage, it shall warrant an additional free, which can be paid at the time of check-in. - Check-in baggage - up to 15kg"
                                            ]
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAtlQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI56",
                                                "ServiceType": "F",
                                                "CommercialName": "Check-in baggage - up to 15kg"
                                            },
                                            "air:Text": [
                                                {
                                                    "_": "Prepaid excess baggage",
                                                    "$": {
                                                        "Type": "Strapline",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingAgent",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingConsumer",
                                                        "LanguageCode": "EN"
                                                    }
                                                }
                                            ],
                                            "air:Title": {
                                                "_": "Check-in baggage - up to 15kg",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:ImageLocation": [
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Consumer",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                },
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Agent",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                }
                                            ],
                                            "air:ServiceGroup": {
                                                "$": {
                                                    "Code": "BG"
                                                },
                                                "air:ServiceSubGroup": {
                                                    "$": {
                                                        "Code": "XS"
                                                    }
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "Baggage",
                                            "TotalPrice": "INR12000.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAvlQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Baggage, 20kg",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "BGXS20",
                                            "BasePrice": "INR12000.00",
                                            "ApproximateTotalPrice": "INR12000.00",
                                            "ApproximateBasePrice": "INR12000.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAxlQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Check-in baggage - up to20kg - Check-in baggage - up to 20kg",
                                                "Excess baggage does not include Special Baggage Charges (charges levied on sporting equipment, skiing equipment, LED/LCD etc.) which shall attract charges over and above. If a passenger is carrying any special baggage, it shall warrant an additional free, which can be paid at the time of check-in. - Check-in baggage - up to 20kg"
                                            ]
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAwlQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI67",
                                                "ServiceType": "F",
                                                "CommercialName": "Check-in baggage - up to 20kg"
                                            },
                                            "air:Text": [
                                                {
                                                    "_": "Prepaid excess baggage",
                                                    "$": {
                                                        "Type": "Strapline",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingAgent",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingConsumer",
                                                        "LanguageCode": "EN"
                                                    }
                                                }
                                            ],
                                            "air:Title": {
                                                "_": "Check-in baggage - up to 20kg",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:ImageLocation": [
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Consumer",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                },
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Agent",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                }
                                            ],
                                            "air:ServiceGroup": {
                                                "$": {
                                                    "Code": "BG"
                                                },
                                                "air:ServiceSubGroup": {
                                                    "$": {
                                                        "Code": "XS"
                                                    }
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "Baggage",
                                            "TotalPrice": "INR11520.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAylQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Baggage, 30kg",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "BGXS30",
                                            "BasePrice": "INR11520.00",
                                            "ApproximateTotalPrice": "INR11520.00",
                                            "ApproximateBasePrice": "INR11520.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKA0lQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Check-in baggage - up to 30kg - Check-in baggage - up to 30kg",
                                                "Excess baggage does not include Special Baggage Charges (charges levied on sporting equipment, skiing equipment, LED/LCD etc.) which shall attract charges over and above. If a passenger is carrying any special baggage, it shall warrant an additional free, which can be paid at the time of check-in. - Check-in baggage - up to 30kg"
                                            ]
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAzlQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI47",
                                                "ServiceType": "F",
                                                "CommercialName": "Check-in baggage - up to 30kg"
                                            },
                                            "air:Text": [
                                                {
                                                    "_": "Prepaid excess baggage",
                                                    "$": {
                                                        "Type": "Strapline",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingAgent",
                                                        "LanguageCode": "EN"
                                                    }
                                                },
                                                {
                                                    "_": "Pack more and save more with our prepaid baggage service.",
                                                    "$": {
                                                        "Type": "MarketingConsumer",
                                                        "LanguageCode": "EN"
                                                    }
                                                }
                                            ],
                                            "air:Title": {
                                                "_": "Check-in baggage - up to 30kg",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:ImageLocation": [
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Consumer",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                },
                                                {
                                                    "_": "https://cdn.travelport.com/indigo/6E_general_medium_52745.jpg",
                                                    "$": {
                                                        "Type": "Agent",
                                                        "ImageWidth": "60",
                                                        "ImageHeight": "60"
                                                    }
                                                }
                                            ],
                                            "air:ServiceGroup": {
                                                "$": {
                                                    "Code": "BG"
                                                },
                                                "air:ServiceSubGroup": {
                                                    "$": {
                                                        "Code": "XS"
                                                    }
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "Baggage",
                                            "TotalPrice": "INR5500.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKA1lQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Baggage, 8kg",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "BG__IN08",
                                            "BasePrice": "INR5500.00",
                                            "ApproximateTotalPrice": "INR5500.00",
                                            "ApproximateBasePrice": "INR5500.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKA3lQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "International Connections baggage - up to 8kg - International Connections baggage - up to 8kg",
                                                "IndiGo offers great prices on purchasing prepaid excess baggage when you are travelling on your domestic IndiGo flight and connecting to/from another international airline. This allowance is over and above your eligible baggage allowance. \nTerms and Conditions for purchasing prepaid excess baggage for International Connecting Flights:\n1. Excess baggage needs to be booked at least 24 hours before the journey.\n2. The International flight should be within 24 hours of the domestic flight.\n3. Passengers should produce relevant international travel documents at the time of check-in- failing which IndiGo will charge excess baggage as per applicable rates at the airport. - International Connections baggage - up to 8kg"
                                            ]
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKA2lQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI45",
                                                "CommercialName": "International Connections baggage - up to 8kg"
                                            },
                                            "air:Title": {
                                                "_": "International Connections baggage - up to 8kg",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "Baggage",
                                            "TotalPrice": "INR7500.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKA4lQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Baggage, 15kg",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "BG__IN15",
                                            "BasePrice": "INR7500.00",
                                            "ApproximateTotalPrice": "INR7500.00",
                                            "ApproximateBasePrice": "INR7500.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKA6lQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "International Connections baggage - up to 15kg - International Connections baggage - up to 15kg",
                                                "IndiGo offers great prices on purchasing prepaid excess baggage when you are travelling on your domestic IndiGo flight and connecting to/from another international airline. This allowance is over and above your eligible baggage allowance. \nTerms and Conditions for purchasing prepaid excess baggage for International Connecting Flights:\n1. Excess baggage needs to be booked at least 24 hours before the journey.\n2. The International flight should be within 24 hours of the domestic flight.\n3. Passengers should produce relevant international travel documents at the time of check-in- failing which IndiGo will charge excess baggage as per applicable rates at the airport. - International Connections baggage - up to 15kg"
                                            ]
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKA5lQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI64",
                                                "CommercialName": "International Connections baggage - up to 15kg"
                                            },
                                            "air:Title": {
                                                "_": "International Connections baggage - up to 15kg",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "Baggage",
                                            "TotalPrice": "INR15000.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKA7lQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Baggage, 30kg",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "BG__IN30",
                                            "BasePrice": "INR15000.00",
                                            "ApproximateTotalPrice": "INR15000.00",
                                            "ApproximateBasePrice": "INR15000.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKA9lQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "International Connections baggage - up to 30kg - International Connections baggage - up to 30kg",
                                                "IndiGo offers great prices on purchasing prepaid excess baggage when you are travelling on your domestic IndiGo flight and connecting to/from another international airline. This allowance is over and above your eligible baggage allowance. \nTerms and Conditions for purchasing prepaid excess baggage for International Connecting Flights:\n1. Excess baggage needs to be booked at least 24 hours before the journey.\n2. The International flight should be within 24 hours of the domestic flight.\n3. Passengers should produce relevant international travel documents at the time of check-in- failing which IndiGo will charge excess baggage as per applicable rates at the airport. - International Connections baggage - up to 30kg"
                                            ]
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKA8lQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI1",
                                                "CommercialName": "International Connections baggage - up to 30kg"
                                            },
                                            "air:Title": {
                                                "_": "International Connections baggage - up to 30kg",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "TravelServices",
                                            "TotalPrice": "INR420.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKA+lQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Fast Forward",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "TSPR",
                                            "BasePrice": "INR420.00",
                                            "ApproximateTotalPrice": "INR420.00",
                                            "ApproximateBasePrice": "INR420.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAAmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": [
                                                "Fast Forward",
                                                "With this service, customers can now avail priority check-in at the Fast Forward check-in counters and anytime boarding."
                                            ]
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKA/lQADAAAAA=="
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKABmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Premium",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__PR",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKACmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Premium Seat Assignment - Premium Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI46",
                                                "CommercialName": "Premium Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Premium Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKADmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAEmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI9",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAFmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAGmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI10",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAHmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAImQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI11",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAJmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAKmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI12",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKALmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAMmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI13",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKANmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAOmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI14",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAPmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAQmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI15",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKARmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKASmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI16",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKATmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAUmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI17",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAVmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAWmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI18",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAXmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAYmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI19",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAZmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAamQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI20",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAbmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAcmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI21",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAdmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAemQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI22",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAfmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAgmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI23",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAhmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAimQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI24",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAjmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAkmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI25",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAlmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAmmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI26",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAnmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAomQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI27",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKApmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAqmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI28",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKArmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAsmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI29",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAtmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAumQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI30",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAvmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAwmQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI31",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAxmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAymQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI32",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAzmQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKA0mQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI33",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR418.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKA1mQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR418.00",
                                            "ApproximateTotalPrice": "INR418.00",
                                            "ApproximateBasePrice": "INR418.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKA3mQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKA2mQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI34",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR393.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKA4mQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR393.00",
                                            "ApproximateTotalPrice": "INR393.00",
                                            "ApproximateBasePrice": "INR393.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKA6mQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKA5mQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI35",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR405.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKA7mQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "true",
                                            "Source": "ACH",
                                            "DisplayText": "Seat",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA",
                                            "BasePrice": "INR405.00",
                                            "ApproximateTotalPrice": "INR405.00",
                                            "ApproximateBasePrice": "INR405.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKA9mQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment"
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKA8mQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI36",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKA+mQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Premium",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__PRX0Z1",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKA/mQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Premium Seat Assignment - Premium Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI53",
                                                "CommercialName": "Premium Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Premium Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAAnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Premium",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__PRX0Z2",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKABnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Premium Seat Assignment - Premium Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI42",
                                                "CommercialName": "Premium Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Premium Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKACnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Premium",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__PRX0Z3",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKADnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Premium Seat Assignment - Premium Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI54",
                                                "CommercialName": "Premium Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Premium Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAEnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Premium",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__PRX0Z4",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAFnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Premium Seat Assignment - Premium Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI58",
                                                "CommercialName": "Premium Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Premium Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAGnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Premium",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__PRX0Z5",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAHnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Premium Seat Assignment - Premium Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI37",
                                                "CommercialName": "Premium Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Premium Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAInQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0ZJ",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAJnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI41",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAKnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0ZK",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKALnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI61",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAMnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0ZL",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKANnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI40",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAOnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0Z1",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAPnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI4",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAQnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0Z2",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKARnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI65",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKASnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0Z3",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKATnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI49",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR675.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAUnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0ZB",
                                            "BasePrice": "INR675.00",
                                            "ApproximateTotalPrice": "INR675.00",
                                            "ApproximateBasePrice": "INR675.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAWnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAVnQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI44",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR625.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAXnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0ZC",
                                            "BasePrice": "INR625.00",
                                            "ApproximateTotalPrice": "INR625.00",
                                            "ApproximateBasePrice": "INR625.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAZnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAYnQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI62",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR650.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAanQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0ZD",
                                            "BasePrice": "INR650.00",
                                            "ApproximateTotalPrice": "INR650.00",
                                            "ApproximateBasePrice": "INR650.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAcnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAbnQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI48",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR675.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAdnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0ZE",
                                            "BasePrice": "INR675.00",
                                            "ApproximateTotalPrice": "INR675.00",
                                            "ApproximateBasePrice": "INR675.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAfnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAenQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI63",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR625.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAgnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0ZF",
                                            "BasePrice": "INR625.00",
                                            "ApproximateTotalPrice": "INR625.00",
                                            "ApproximateBasePrice": "INR625.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAinQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAhnQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI43",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR650.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAjnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Standard",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__X0ZG",
                                            "BasePrice": "INR650.00",
                                            "ApproximateTotalPrice": "INR650.00",
                                            "ApproximateBasePrice": "INR650.00",
                                            "Taxes": "INR0",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAlnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Standard Seat Assignment - Standard Seat Assignment"
                                        },
                                        "air:TaxInfo": {
                                            "$": {
                                                "Category": "DU",
                                                "CarrierDefinedCategory": "36GST",
                                                "Amount": "INR0",
                                                "Key": "7RlXH6SqWDKAknQADAAAAA=="
                                            }
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI59",
                                                "CommercialName": "Standard Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Standard Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAmnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Premium",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__PRX0Z6",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKAnnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Premium Seat Assignment - Premium Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI50",
                                                "CommercialName": "Premium Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Premium Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAonQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat, Business",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__BCFR1",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKApnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Business Seat Assignment - Business Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI57",
                                                "CommercialName": "Business Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Business Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Type": "PreReservedSeatAssignment",
                                            "TotalPrice": "INR0.00",
                                            "SupplierCode": "6E",
                                            "CreateDate": "2026-06-03T12:25:53.323+00:00",
                                            "ServiceStatus": "Offered",
                                            "Key": "7RlXH6SqWDKAqnQADAAAAA==",
                                            "AssessIndicator": "MileageOrCurrency",
                                            "IsPricingApproximate": "false",
                                            "Source": "ACH",
                                            "DisplayText": "Seat Business",
                                            "ProviderCode": "ACH",
                                            "Quantity": "1",
                                            "ProviderDefinedType": "SA__BCFR2",
                                            "BasePrice": "INR0.00",
                                            "ApproximateTotalPrice": "INR0.00",
                                            "ApproximateBasePrice": "INR0.00",
                                            "OptionalServicesRuleRef": "7RlXH6SqWDKArnQADAAAAA=="
                                        },
                                        "common_v54_0:ServiceData": {
                                            "$": {
                                                "BookingTravelerRef": "7RlXH6SqWDKAP1OADAAAAA==",
                                                "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                            }
                                        },
                                        "common_v54_0:ServiceInfo": {
                                            "common_v54_0:Description": "Business Seat Assignment - Business Seat Assignment"
                                        },
                                        "air:BrandingInfo": {
                                            "$": {
                                                "Key": "BI6",
                                                "CommercialName": "Business Seat Assignment"
                                            },
                                            "air:Title": {
                                                "_": "Business Seat Assignment",
                                                "$": {
                                                    "Type": "External",
                                                    "LanguageCode": "EN"
                                                }
                                            },
                                            "air:AirSegmentRef": {
                                                "$": {
                                                    "Key": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    }
                                ],
                                "air:OptionalServiceRules": [
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKASlQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "ML__FR"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAUlQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": [
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "PassengerSegment",
                                                            "MaximumQuantity": "1"
                                                        }
                                                    },
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "Segment",
                                                            "MaximumQuantity": "9"
                                                        }
                                                    }
                                                ]
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "MLSNVGZ2"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAWlQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": [
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "PassengerSegment",
                                                            "MaximumQuantity": "1"
                                                        }
                                                    },
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "Segment",
                                                            "MaximumQuantity": "9"
                                                        }
                                                    }
                                                ]
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "MLSNCNZ2"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAYlQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": [
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "PassengerSegment",
                                                            "MaximumQuantity": "1"
                                                        }
                                                    },
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "Segment",
                                                            "MaximumQuantity": "9"
                                                        }
                                                    }
                                                ]
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "ML__VGZ8"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAalQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": [
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "PassengerSegment",
                                                            "MaximumQuantity": "1"
                                                        }
                                                    },
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "Segment",
                                                            "MaximumQuantity": "9"
                                                        }
                                                    }
                                                ]
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "ML__CNYC"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAclQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": [
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "PassengerSegment",
                                                            "MaximumQuantity": "1"
                                                        }
                                                    },
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "Segment",
                                                            "MaximumQuantity": "9"
                                                        }
                                                    }
                                                ]
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "ML__VGZM"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAelQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": [
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "PassengerSegment",
                                                            "MaximumQuantity": "1"
                                                        }
                                                    },
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "Segment",
                                                            "MaximumQuantity": "9"
                                                        }
                                                    }
                                                ]
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "ML__VGZN"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAglQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": [
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "PassengerSegment",
                                                            "MaximumQuantity": "1"
                                                        }
                                                    },
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "Segment",
                                                            "MaximumQuantity": "9"
                                                        }
                                                    }
                                                ]
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "ML__SHZ6"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAilQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": [
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "PassengerSegment",
                                                            "MaximumQuantity": "1"
                                                        }
                                                    },
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "Segment",
                                                            "MaximumQuantity": "9"
                                                        }
                                                    }
                                                ]
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "ML__SHZ7"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAllQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "true",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerOD"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerOD",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "BGXS03"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAolQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "true",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerOD"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerOD",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "BGXS05"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKArlQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "true",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerOD"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerOD",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "BGXS10"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAulQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "true",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerOD"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerOD",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "BGXS15"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAxlQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "true",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerOD"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerOD",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "BGXS20"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKA0lQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "true",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerOD"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerOD",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "BGXS30"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKA3lQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "true",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerOD"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerOD",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "BG__IN08"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKA6lQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "true",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerOD"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerOD",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "BG__IN15"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKA9lQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "true",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerOD"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerOD",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "BG__IN30"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAAmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "true",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "true",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerOD"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": [
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "PassengerOD",
                                                            "MaximumQuantity": "1"
                                                        }
                                                    },
                                                    {
                                                        "$": {
                                                            "ApplicableLevel": "Segment",
                                                            "MaximumQuantity": "9"
                                                        }
                                                    }
                                                ]
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKACmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__PR"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAEmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAGmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAImQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAKmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAMmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAOmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAQmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKASmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAUmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAWmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAYmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAamQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAcmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAemQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAgmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAimQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAkmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAmmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAomQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAqmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAsmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAumQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAwmQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAymQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKA0mQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKA3mQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKA6mQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKA9mQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKA/mQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__PRX0Z1"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKABnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__PRX0Z2"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKADnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__PRX0Z3"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAFnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__PRX0Z4"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAHnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__PRX0Z5"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAJnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0ZJ"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKALnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0ZK"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKANnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0ZL"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAPnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0Z1"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKARnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0Z2"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKATnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0Z3"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAWnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0ZB"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAZnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0ZC"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAcnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0ZD"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAfnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0ZE"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAinQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0ZF"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAlnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__X0ZG"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKAnnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "true"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__PRX0Z6"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKApnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__BCFR1"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$": {
                                            "Key": "7RlXH6SqWDKArnQADAAAAA=="
                                        },
                                        "common_v54_0:ApplicationRules": {
                                            "$": {
                                                "RequiredForAllTravelers": "false",
                                                "RequiredForAllSegments": "false",
                                                "RequiredForAllSegmentsInOD": "false",
                                                "UnselectedOptionRequired": "false",
                                                "SecondaryOptionCodeRequired": "false"
                                            }
                                        },
                                        "common_v54_0:ApplicationLevel": {
                                            "$": {
                                                "ApplicableLevels": "PassengerSegment"
                                            },
                                            "common_v54_0:ApplicationLimits": {
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            },
                                            "common_v54_0:ServiceData": {
                                                "$": {
                                                    "AirSegmentRef": "7RlXH6SqWDKAzkQADAAAAA=="
                                                }
                                            }
                                        },
                                        "common_v54_0:SecondaryTypeRules": {
                                            "common_v54_0:SecondaryTypeRule": {
                                                "$": {
                                                    "SecondaryType": "SA__BCFR2"
                                                },
                                                "common_v54_0:ApplicationLimit": {
                                                    "$": {
                                                        "ApplicableLevel": "PassengerSegment",
                                                        "MaximumQuantity": "1"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }
    }
}