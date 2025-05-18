// VibeKeeper/Core/Services/NetworkClient.swift
import Foundation
import Combine

enum APIError: Error, LocalizedError {
    case invalidURL
    case requestFailed(Error)
    case decodingFailed(Error)
    case statusCode(Int, Data?)
    case unknown(Error? = nil)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL encountered."
        case .requestFailed(let error): return "Request failed: \(error.localizedDescription)"
        case .decodingFailed(let error): return "Failed to decode response: \(error.localizedDescription)"
        case .statusCode(let code, _): return "Received HTTP status code \(code)."
        case .unknown(let error): return "An unknown error occurred: \(error?.localizedDescription ?? "No details")"
        }
    }
}

protocol APIEndpoint {
    var baseURL: URL { get }
    var path: String { get }
    var method: String { get }
    var headers: [String: String]? { get }
    var parameters: [String: Any]? { get }
}

extension APIEndpoint {
    var urlRequest: URLRequest? {
        guard var components = URLComponents(url: baseURL.appendingPathComponent(path), resolvingAgainstBaseURL: true) else {
            return nil
        }

        if method == "GET", let parameters = parameters as? [String: String] {
            components.queryItems = parameters.map { URLQueryItem(name: $0.key, value: $0.value) }
        }
        
        guard let url = components.url else { return nil }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.allHTTPHeaderFields = headers
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if method != "GET", let parameters = parameters {
            request.httpBody = try? JSONSerialization.data(withJSONObject: parameters)
        }
        return request
    }
}

protocol NetworkClientProtocol {
    func request<T: Decodable>(_ endpoint: APIEndpoint) -> AnyPublisher<T, APIError>
}

class NetworkClient: NetworkClientProtocol {
    static let shared = NetworkClient()
    private let session: URLSession
    private let decoder: JSONDecoder

    private init(session: URLSession = .shared, decoder: JSONDecoder = JSONDecoder()) {
        self.session = session
        self.decoder = decoder
        self.decoder.dateDecodingStrategy = .iso8601
    }

    func request<T: Decodable>(_ endpoint: APIEndpoint) -> AnyPublisher<T, APIError> {
        guard let urlRequest = endpoint.urlRequest else {
            return Fail(error: APIError.invalidURL).eraseToAnyPublisher()
        }

        return session.dataTaskPublisher(for: urlRequest)
            .tryMap { data, response -> Data in
                guard let httpResponse = response as? HTTPURLResponse else {
                    throw APIError.unknown()
                }
                guard (200..<300).contains(httpResponse.statusCode) else {
                    throw APIError.statusCode(httpResponse.statusCode, data)
                }
                return data
            }
            .decode(type: T.self, decoder: decoder)
            .mapError { error -> APIError in
                if let apiError = error as? APIError {
                    return apiError
                } else if error is DecodingError {
                    return APIError.decodingFailed(error)
                } else {
                    return APIError.requestFailed(error)
                }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
}
