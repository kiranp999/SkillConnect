from rest_framework.views import exception_handler


def _flatten_errors(data):
    if isinstance(data, dict):
        parts = []
        for field, value in data.items():
            if isinstance(value, (list, tuple)):
                parts.extend([f'{field}: {item}' for item in value])
            elif isinstance(value, dict):
                parts.append(f'{field}: {_flatten_errors(value)}')
            else:
                parts.append(f'{field}: {value}')
        return ' '.join(parts)
    if isinstance(data, (list, tuple)):
        return ' '.join(str(item) for item in data)
    return str(data)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    message = response.data.get('detail') if isinstance(response.data, dict) else None
    message = str(message) if message else _flatten_errors(response.data)
    response.data = {
        'status': 'error',
        'status_code': response.status_code,
        'message': message,
        'error': message,
        'errors': response.data,
    }
    return response
